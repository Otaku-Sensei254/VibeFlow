import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-tide-50/50 via-white to-flow-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-tide-600 hover:text-tide-700 dark:text-tide-400 mb-6 transition-colors"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 bg-gradient-to-r from-tide-600 to-flow-600 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated: July 7, 2026
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              1. Information We Collect
            </h2>
            <p>
              When you register for an account, we collect your username, email address, and password.
              As you use VibeFlow, we collect information about your activity, including posts you create,
              waves you share, comments, likes, and other interactions. We also collect usage data such as
              device information, IP address, browser type, and how you interact with the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide, maintain, and improve our services, personalise your
              experience, communicate with you, and ensure platform safety. Your email is used for account
              verification, password resets, and important service announcements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              3. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell your personal information. We may share data with service providers who help
              us operate the platform (hosting, analytics, email delivery), when required by law, or to
              protect the rights and safety of our users and the public.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              4. Data Retention
            </h2>
            <p>
              We retain your account information for as long as your account is active. You can request
              account deletion at any time through your Settings or by emailing{" "}
              <a href="mailto:vibeflowtech@gmail.com" className="text-tide-600 hover:underline">vibeflowtech@gmail.com</a>.
              Upon deletion, we will delete or anonymise your data within 30 days, except where required
              to retain it for legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can manage most of
              this through your account settings. For additional requests, contact us at{" "}
              <a href="mailto:vibeflowtech@gmail.com" className="text-tide-600 hover:underline">
                vibeflowtech@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              6. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and security. We may use analytics cookies to
              understand platform usage. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              7. Security
            </h2>
            <p>
              We implement industry-standard security measures including encryption in transit and at rest,
              secure password hashing, and regular security audits. However, no method of transmission over
              the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              via email or through the platform. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              9. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:vibeflowtech@gmail.com" className="text-tide-600 hover:underline">
                vibeflowtech@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
