import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { adminAPI } from "../../services/api";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/layout/Navbar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    // Check if admin
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 50 }),
      ]);
      setStats(statsRes.data.data.stats);
      setUsers(usersRes.data.data.users);
    } catch (error) {
      console.error("Failed to fetch dashboard ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, { role: newRole });
      fetchDashboardData();
    } catch (error) {
      alert("Failed to update user role", error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        fetchDashboardData();
      } catch (error) {
        alert("Failed to delete user", error.message);
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Manage users and view system statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Admins</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalAdmins || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Regular Users</p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalRegularUsers || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-dark-gray rounded-lg border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">
                User Management
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded text-white 
                    focus:outline-none focus:border-primary"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-dark border border-gray-700 rounded text-white 
                    focus:outline-none focus:border-primary"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-dark/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {u.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium">
                            {u.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u._id, e.target.value)
                          }
                          disabled={u._id === user._id}
                          className="px-3 py-1 bg-dark border border-gray-700 rounded text-white text-sm 
                            focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === user._id}
                          className="text-red-500 hover:text-red-400 transition disabled:opacity-50"
                          title="Delete user"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No users found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
