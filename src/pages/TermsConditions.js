import { Link } from "react-router-dom";

export default function TermsConditions() {
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
          Terms and Conditions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated: July 7, 2026
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or using VibeFlow, you agree to these Terms and Conditions. If you
              do not agree, do not use the service. We reserve the right to update these terms, and your
              continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use VibeFlow. By registering, you represent that you
              meet this requirement and that all information you provide is accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              3. Account Responsibility
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities under your account. You must notify us immediately of any unauthorised use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              4. User Conduct
            </h2>
            <p>
              You agree not to use VibeFlow for any unlawful purpose or to violate any applicable laws.
              Prohibited activities include harassment, spam, impersonation, distributing malware, and
              infringing on others&apos; intellectual property rights. Content that is hateful, violent,
              or sexually explicit is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              5. Content Ownership
            </h2>
            <p>
              You retain ownership of the content you post on VibeFlow. By posting content, you grant us a
              non-exclusive, royalty-free licence to display, distribute, and promote your content on the
              platform. You represent that you have the rights to share any content you post.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              6. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, at our sole
              discretion. You may delete your account at any time through settings. Upon termination, your
              right to use the service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              7. Disclaimer of Warranties
            </h2>
            <p>
              VibeFlow is provided &quot;as is&quot; without warranties of any kind, express or implied.
              We do not guarantee that the service will be uninterrupted, secure, or error-free. Your use
              is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, VibeFlow shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the service, even if advised
              of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              9. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which VibeFlow operates. Any
              disputes shall be resolved in the courts of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
              10. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{" "}
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
