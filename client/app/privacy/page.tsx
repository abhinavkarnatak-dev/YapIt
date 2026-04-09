import React from 'react';
import LegalHeader from '@/components/LegalHeader';
import LegalFooter from '@/components/LegalFooter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20 space-y-12">
        <div className="space-y-4 border-b border-surface-container-high pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-on-surface">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant uppercase text-sm font-semibold tracking-wider">
            Effective Date: January 1, 2026
          </p>
        </div>

        <div className="space-y-10 text-on-surface-variant leading-relaxed text-lg">
          <p>
            At YapIt, protecting your privacy is important to us. This Privacy Policy explains
            what information we collect, how we use it, and the choices you have regarding your
            data when using our real-time messaging platform.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              1. Information We Collect
            </h2>

            <p>
              We collect certain information to provide and maintain the YapIt service.
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-on-surface">Account Information:</strong> When you create
                an account, we collect your name and email address. Your email address is verified
                using a one-time password (OTP) to ensure secure access to your account.
              </li>

              <li>
                <strong className="text-on-surface">Profile Information:</strong> You may optionally
                upload or update a profile picture through your profile settings.
              </li>

              <li>
                <strong className="text-on-surface">Messages and Shared Content:</strong> Messages,
                files, and media shared on YapIt are processed and stored on our secure
                infrastructure so they can be delivered to recipients and accessed across your
                devices.
              </li>

              {/* <li>
                <strong className="text-on-surface">Usage Data:</strong> We may collect limited
                technical information such as connection logs, device information, and system
                performance metrics to improve reliability and troubleshoot issues.
              </li> */}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              2. How We Use Your Information
            </h2>

            <p>We use the information we collect to:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the YapIt messaging service.</li>
              <li>Authenticate users securely through OTP verification.</li>
              <li>Deliver messages, files, and notifications between users.</li>
              <li>Improve platform performance and user experience.</li>
              <li>Detect and prevent spam, abuse, or security threats.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              3. Information Security
            </h2>

            <p>
              YapIt uses industry-standard security practices to protect your information.
              Communication between your device and our servers is encrypted using HTTPS and
              secure WebSocket connections.
            </p>

            <p>
              While we take strong measures to protect your data, no system can guarantee
              absolute security. Users are responsible for keeping their email accounts and
              authentication credentials secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              4. Data Sharing
            </h2>

            <p>
              YapIt does not sell or rent your personal information to third parties.
            </p>

            <p>
              We may work with trusted service providers (such as cloud hosting or storage
              providers) to operate our infrastructure. These providers process data only
              for the purpose of supporting the YapIt service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              5. Your Privacy Controls
            </h2>

            <p>You have control over your information on YapIt. You may:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Update your name or profile picture.</li>
              <li>Delete your account permanently.</li>
            </ul>

            <p>
              We delete your information from active systems and may retain certain data for a limited time where necessary for security, legal, or operational purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              6. Changes to This Privacy Policy
            </h2>

            <p>
              We may update this Privacy Policy from time to time to reflect improvements
              to the service or legal requirements. When we do, we will update the Effective
              Date at the top of this page.
            </p>

            <p>
              Continued use of YapIt after updates means you agree to the revised policy.
            </p>
          </section>

          {/* <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              7. Contact Us
            </h2>

            <p>
              If you have any questions about this Privacy Policy or how your data is handled,
              please contact us:
            </p>

            <p>Email: support@yapit.com</p>
          </section> */}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}