import React from 'react';
import LegalHeader from '@/components/LegalHeader';
import LegalFooter from '@/components/LegalFooter';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <LegalHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20 space-y-12">
        <div className="space-y-4 border-b border-surface-container-high pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline text-on-surface">Privacy Policy</h1>
          <p className="text-on-surface-variant uppercase text-sm font-semibold tracking-wider">Effective Date: January 1, 2026</p>
        </div>

        <div className="space-y-10 text-on-surface-variant leading-relaxed text-lg">
          <p>
            At YapIt, we build products that bring people together. The foundation of those connections is trust. This Privacy Policy is meant to help you understand what information we collect, why we collect it, and how you can update, manage, export, and delete your information.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">1. Information We Collect</h2>
            <p>
              We want you to understand the types of information we collect as you use our real-time messaging services. We collect information to provide better services to all our users.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-on-surface">Account Information:</strong> When you create a YapIt account, you provide us with personal information that includes your name, a password, and an email address.</li>
              <li><strong className="text-on-surface">Messages and Content:</strong> We encrypt your chats in-transit. By default, your message history and media are stored on our secure AWS S3 and database infrastructure so you can seamlessly access your chats across devices.</li>
              <li><strong className="text-on-surface">Usage Data:</strong> We collect information about your activity on our services, which we use to do things like improve message delivery speed and diagnose backend crashes.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">2. How We Use Your Information</h2>
            <p>We use the information we collect from all our services for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our real-time messaging architecture.</li>
              <li>To develop new features and communication tools.</li>
              <li>To protect YapIt, our users, and the public from spam, abuse, and security threats.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">3. Information Security</h2>
            <p>
              yapIt is built with strong security features that continuously protect your information.
              The insights we gain from maintaining our services help us detect and automatically block security threats from ever reaching you. We build strict security protocols into the core of our platform, including industry-standard WebSocket and HTTPs encryption for all data in transit. Ensure you keep your authentication tokens and passwords secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-on-surface font-headline">4. Your Privacy Controls</h2>
            <p>
              You have choices regarding the information we collect and how it's used. You can request a complete export of your chat history or permanently delete your account directly through your user profile settings page at any time. When you request a deletion, we immediately begin the process of removing your data from our active storage.
            </p>
          </section>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}