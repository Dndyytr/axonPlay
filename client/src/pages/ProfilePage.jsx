import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  updateProfile,
  changePassword,
  deleteAccount,
  logout,
} from "../store/authSlice";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DeleteAccountModal from "../components/modals/DeleteAccountModal";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'password' | 'security'
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await dispatch(updateProfile(profileData)).unwrap();
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: "error", text: error || "Failed to update profile" });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    try {
      await dispatch(changePassword(passwordData)).unwrap();
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({ type: "error", text: error || "Failed to change password" });
    }
  };

  const handleDeleteAccount = async (password) => {
    try {
      await dispatch(deleteAccount(password)).unwrap();
      dispatch(logout());
      navigate("/");
    } catch (error) {
      setMessage({ type: "error", text: error || "Failed to delete account" });
      setShowDeleteModal(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-12">
          {/* Header */}
          <div className="py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-400">
              Manage your profile and account preferences
            </p>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 px-6 py-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500 text-green-500"
                  : "bg-red-500/10 border border-red-500 text-red-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{user.username}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  {user.role === "admin" && (
                    <span className="mt-2 bg-primary/20 text-primary text-xs px-3 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      activeTab === "profile"
                        ? "bg-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      activeTab === "password"
                        ? "bg-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`w-full text-left px-4 py-2 rounded transition ${
                      activeTab === "security"
                        ? "bg-primary text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    Security
                  </button>
                </nav>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-400 rounded hover:text-white hover:bg-gray-700 transition"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Profile Information
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-primary hover:text-red-400 transition"
                      >
                        <PencilIcon className="w-5 h-5" />
                        Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing || loading}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={profileData.avatar}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            avatar: e.target.value,
                          })
                        }
                        disabled={!isEditing || loading}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition disabled:opacity-50"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary px-6 py-3 rounded text-white font-semibold 
                            hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              username: user.username,
                              email: user.email,
                              avatar: user.avatar,
                            });
                          }}
                          className="bg-gray-700 px-6 py-3 rounded text-white font-semibold 
                            hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Change Password
                  </h2>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        disabled={loading}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        disabled={loading}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        disabled={loading}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                          focus:outline-none focus:border-primary transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary px-6 py-3 rounded text-white font-semibold 
                        hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="bg-dark-gray rounded-lg p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Account Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Account Status
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Member since:{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Role:{" "}
                        <span className="text-primary capitalize">
                          {user.role}
                        </span>
                      </p>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-red-500 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 bg-red-500/20 text-red-500 px-6 py-3 rounded 
                          font-semibold hover:bg-red-500/30 transition"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default ProfilePage;
