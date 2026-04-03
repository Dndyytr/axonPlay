import { useState } from "react";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const DeleteAccountModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onConfirm(password);
    } catch (err) {
      setError(err || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-gray rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Delete Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <p className="text-red-500 font-semibold">Warning!</p>
              <p className="text-red-400 text-sm mt-1">
                This action cannot be undone. All your data, watchlist, and
                history will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Password Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white 
                focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-700 px-6 py-3 rounded text-white font-semibold 
                hover:bg-gray-600 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 bg-red-500 px-6 py-3 rounded text-white font-semibold 
                hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
