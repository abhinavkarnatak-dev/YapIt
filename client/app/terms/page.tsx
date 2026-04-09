import React from 'react';
import LegalHeader from '@/components/LegalHeader';
import LegalFooter from '@/components/LegalFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20 space-y-12">
        <div className="space-y-4 border-b border-surface-container-high pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-on-surface">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant uppercase text-sm font-semibold tracking-wider">
            Effective Date: January 1, 2026
          </p>
        </div>

        <div className="space-y-10 text-on-surface-variant leading-relaxed text-lg">
          <p>
            Welcome to YapIt, a real-time messaging platform designed to help people communicate quickly and securely. 
            By accessing or using YapIt, you agree to comply with and be bound by these Terms of Service. 
            If you do not agree with these terms, please do not use the service.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              1. Using YapIt
            </h2>
            <p>
              YapIt provides messaging features that allow users to send text messages, share files, and communicate with others in real time.
            </p>

            <p>To use the service, you must:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when creating an account.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
              <li>Keep your login credentials secure.</li>
              {/* <li>Notify us immediately if you suspect unauthorized access to your account.</li> */}
            </ul>

            <p>
              Failure to follow these responsibilities may result in suspension or termination of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              2. Acceptable Use
            </h2>
            <p>
              YapIt is built to create a safe and respectful communication environment. 
              By using our service, you agree not to:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Share content that is illegal, abusive, threatening, or discriminatory.</li>
              <li>Harass, bully, or harm other users.</li>
              <li>Impersonate another person or misrepresent your identity.</li>
              <li>Attempt to hack, reverse engineer, scrape, or disrupt the platform.</li>
              <li>Spread malware, spam, or unwanted advertising.</li>
              <li>Misuse messaging or file-sharing features.</li>
            </ul>

            <p>
              We reserve the right to remove content or suspend accounts that violate these rules.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              3. User Content
            </h2>

            <p>
              You retain full ownership of the content you create and share on YapIt, including:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Messages</li>
              <li>Files</li>
              <li>Profile information</li>
            </ul>

            <p>
              However, to operate the service, you grant YapIt a limited, worldwide, non-exclusive,
              royalty-free license to store, transmit, and display your content solely for the purpose
              of providing the service.
            </p>

            <p>Your private communications will not be used for advertising purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              4. Service Availability
            </h2>

            <p>
              We continuously work to improve YapIt, but we cannot guarantee that the service will
              always be available without interruptions.
            </p>

            <p>The service may occasionally be unavailable due to:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Maintenance or updates</li>
              <li>Technical issues</li>
              <li>Network failures</li>
              <li>Events beyond our control</li>
            </ul>

            <p>
              We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              5. Limitation of Liability
            </h2>

            <p>YapIt is provided "as is" and "as available."</p>

            <p>
              To the fullest extent permitted by law, YapIt and its operators will not be liable for:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect or consequential damages</li>
              <li>Loss of data</li>
              <li>Service interruptions</li>
              <li>Damages caused by other users</li>
            </ul>

            <p>Your use of the service is at your own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              6. Termination
            </h2>

            <p>We may suspend or terminate your access to YapIt if:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>You violate these Terms</li>
              <li>You misuse the service</li>
              <li>Your activity creates legal or security risks</li>
            </ul>

            <p>You may stop using the service at any time.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              7. Changes to These Terms
            </h2>

            <p>
              We may update these Terms occasionally to reflect improvements or legal requirements.
              If significant changes are made, we will update the Effective Date and notify users
              where appropriate.
            </p>

            <p>
              Continued use of YapIt after changes means you accept the updated Terms.
            </p>
          </section>

          {/* <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              8. Contact Us
            </h2>

            <p>
              If you have any questions about these Terms or the YapIt service, please contact us:
            </p>

            <p>Email: support@yapit.com</p>
          </section> */}
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}