import { useState } from "react";
import { adminApi } from "../../utils/api";
import { motion } from "framer-motion";

const STATES = {
  IDLE: "idle",
  SENDING: "sending",
  SUCCESS: "success",
  ERROR: "error",
};

export default function AdminCommunicationsHub() {
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
    sender_name: "",
  });
  const [state, setState] = useState(STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(STATES.SENDING);
    setError(null);
    setResult(null);

    try {
      const data = await adminApi.sendBroadcastEmail(formData);
      setResult(data);
      setState(STATES.SUCCESS);
      setFormData({ subject: "", body: "", sender_name: "" });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to send broadcast email. Please try again."
      );
      setState(STATES.ERROR);
    }
  };

  const isLoading = state === STATES.SENDING;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communications Hub
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Send broadcast emails to all registered users.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 focus:border-transparent disabled:opacity-50"
            placeholder="Enter email subject"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sender Name
          </label>
          <input
            type="text"
            name="sender_name"
            value={formData.sender_name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 focus:border-transparent disabled:opacity-50"
            placeholder="Leave blank to use default (VibeFlow Team)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message Body
          </label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            disabled={isLoading}
            rows={12}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 focus:border-transparent disabled:opacity-50 resize-y"
            placeholder="Enter your message here. Supports HTML."
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-700">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-2 bg-tide-600 text-white rounded-lg font-semibold hover:bg-tide-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tide-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              "Send Broadcast Email"
            )}
          </button>
        </div>
      </form>

      {/* Result/Error Messages */}
      {state === STATES.SUCCESS && result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <p className="text-green-800 dark:text-green-200">
            Broadcast email sent successfully! Sent to {result.sent} of{" "}
            {result.total} users.
          </p>
        </motion.div>
      )}

      {state === STATES.ERROR && error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
