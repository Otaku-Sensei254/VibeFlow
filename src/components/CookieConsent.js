import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Cookie Consent</p>
          <button onClick={decline} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
          We use essential cookies for authentication and security. By continuing, you agree to our{" "}
          <Link to="/privacy" className="text-tide-600 hover:underline">Privacy Policy</Link>{" "}
          and{" "}
          <Link to="/terms" className="text-tide-600 hover:underline">Terms of Service</Link>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-tide-600 to-flow-600 rounded-xl hover:from-tide-700 hover:to-flow-700 transition-all duration-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
