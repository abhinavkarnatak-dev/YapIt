import React from 'react';
import LegalHeader from '@/components/LegalHeader';
import LegalFooter from '@/components/LegalFooter';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20 space-y-12">
        <div className="space-y-4 border-b border-surface-container-high pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-on-surface">Terms of Service</h1>
          <p className="text-on-surface-variant uppercase text-sm font-semibold tracking-wider">Effective Date: January 1, 2026</p>
        </div>

        <div className="space-y-10 text-on-surface-variant leading-relaxed text-lg">
          <p>
            Welcome to YapIt. By getting access to or using our real-time messaging application and related websites and services, you agree to be bound by these Terms. If you do not agree to these terms, please do not use the services.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">1. Account Security</h2>
            <p>
              When you create an account, you agree to provide complete and accurate information. You are solely responsible for maintaining the confidentiality of your login credentials and for any activity that occurs under your account. You must notify us immediately upon suspecting any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">2. Acceptable Use and Community Standards</h2>
            <p>
              YapIt is designed to connect individuals safely and securely. While using the platform, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Transmit any defamatory, harassing, abusive, illegal, or discriminatory content.</li>
              <li>Attempt to scrape, reverse-engineer, or distribute malicious code on our WebSocket architecture.</li>
              <li>Impersonate another user, employee, or representative of YapIt.</li>
              <li>Spam, aggressively advertise, or abuse the file-sharing capabilities of the platform.</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these terms to maintain a secure ecosystem for the rest of our users.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">3. Content Ownership and Licensing</h2>
            <p>
              You maintain full ownership of the text messages, files, and profile pictures you upload to YapIt. However, to operate our service (such as routing messages through our servers, rendering them on receivers' devices, and storing them in our S3 buckets), you grant us a worldwide, non-exclusive, royalty-free license to host and transmit this content solely for the purpose of operating the YapIt service. We do not use your private communications for external advertising.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">4. Disclaimers and Limitations of Liability</h2>
            <p>
              We provide the Services "as is" and without warranty of any kind. To the fullest extent permitted by law, YapIt and its affiliates disclaim all warranties, whether express or implied. In no event shall we be liable for any indirect, incidental, or consequential damages arising from your use of the service or any disruption in the platform's availability.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">5. Contact</h2>
            <p>
              If you have any questions or concerns about these Terms, feel free to reach out to our dedicated support chat or email us directly at support@yapit.com.
            </p>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}