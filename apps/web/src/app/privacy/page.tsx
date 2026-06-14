import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — TwilioHub OSS',
  description: 'Privacy Policy for TwilioHub OSS communications platform by Nodedr Infotech Pvt Ltd.',
};

const EFFECTIVE_DATE = 'January 1, 2025';
const COMPANY = 'Nodedr Infotech Pvt Ltd';
const WEBSITE = 'www.nodedr.com';
const EMAIL = 'privacy@nodedr.com';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">TwilioHub</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="prose-custom space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS is an open-source software project developed and maintained by <strong className="text-foreground">{COMPANY}</strong>, a technology company registered in India. Our website is <strong className="text-foreground">{WEBSITE}</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              TwilioHub OSS is <strong className="text-foreground">self-hosted software</strong>. This Privacy Policy applies to the software itself and to any services we operate directly. When you deploy TwilioHub OSS on your own infrastructure, you become the data controller for your users' data, and you are responsible for your own privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">When you use a TwilioHub OSS instance (whether self-hosted or operated by a third party), the following data may be collected and stored in <strong className="text-foreground">your own database</strong>:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li><strong className="text-foreground">Account Information:</strong> Name, email address, password (hashed with Argon2id — never stored in plain text), role, and organization association.</li>
              <li><strong className="text-foreground">Communication Data:</strong> SMS message content, phone numbers, delivery statuses, call logs, call recordings (if enabled via Twilio), and campaign data.</li>
              <li><strong className="text-foreground">Contact Records:</strong> Contact names, phone numbers, email addresses, company names, tags, and custom fields you enter into the CRM.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Login timestamps, IP addresses at login, and audit logs of administrative actions.</li>
              <li><strong className="text-foreground">Twilio Credentials:</strong> Account SID, Auth Token, and API keys — stored encrypted using AES-256-GCM with a key derived via scrypt. These are never transmitted to Nodedr or any third party.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How Your Data Is Used</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Data stored in TwilioHub OSS is used exclusively to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>Authenticate users and enforce role-based access</li>
              <li>Send and receive SMS messages via your Twilio account</li>
              <li>Place and receive voice calls via your Twilio account</li>
              <li>Track message and call history for your records</li>
              <li>Execute and track SMS campaigns</li>
              <li>Generate analytics for your own organization</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong className="text-foreground">Nodedr Infotech does not have access to data stored on self-hosted instances.</strong> We never collect or receive your messages, contacts, Twilio credentials, or any operational data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">TwilioHub OSS integrates with the following third-party services:</p>
            <ul className="space-y-3 text-muted-foreground pl-2">
              <li>
                <strong className="text-foreground">Twilio Inc.</strong> — All SMS and voice communications are transmitted through Twilio's infrastructure. Twilio is the data processor for message content in transit. Twilio's privacy policy governs how they handle communications data: <span className="text-primary">twilio.com/legal/privacy</span>
              </li>
              <li>
                <strong className="text-foreground">OpenRouter (optional)</strong> — If AI features are enabled, message context may be sent to OpenRouter's API to generate reply suggestions or campaign content. No contact identifiers are sent. OpenRouter's privacy policy applies: <span className="text-primary">openrouter.ai/privacy</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You may disable AI features entirely by not setting an <code className="text-primary font-mono text-xs bg-muted px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> in your environment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              As TwilioHub OSS is self-hosted, you control how long data is retained. The software does not automatically delete messages, calls, contacts, or logs unless you configure it to do so. We recommend setting a data retention policy appropriate for your jurisdiction and use case.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              The built-in backup system retains database backups for 7 days by default. This can be adjusted in <code className="text-primary font-mono text-xs bg-muted px-1 py-0.5 rounded">docker/backups/backup.sh</code>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">TwilioHub OSS implements the following security measures by default:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>Argon2id password hashing (resistant to GPU and ASIC attacks)</li>
              <li>AES-256-GCM encryption for stored Twilio credentials with unique keys per record</li>
              <li>JWT-based authentication with 15-minute access token expiry and refresh token rotation</li>
              <li>Optional TOTP-based two-factor authentication (RFC 6238)</li>
              <li>Row-level data isolation by organization ID</li>
              <li>TLS/HTTPS support via Nginx (configuration required)</li>
              <li>Rate limiting on all API endpoints</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the following rights regarding personal data stored in TwilioHub OSS:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li><strong className="text-foreground">Right to Access:</strong> Request a copy of personal data stored about you</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Correct inaccurate personal data</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your account and associated data</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Export your data (contacts exportable via CSV)</li>
              <li><strong className="text-foreground">Right to Object:</strong> Object to processing of your personal data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, contact the administrator of the TwilioHub instance you use. If you use a Nodedr-operated service, contact us at <strong className="text-foreground">{EMAIL}</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS is a business communications platform intended for use by adults. We do not knowingly collect personal information from persons under the age of 16. If you believe a child has provided personal information through a TwilioHub instance, contact the instance administrator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Open Source Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS source code is publicly available under the MIT License. The code itself does not contain tracking, telemetry, or any mechanism that sends data to Nodedr or any other party. You can verify this by reviewing the source code at our repository.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top and publish the change in the project's CHANGELOG. Continued use of the software after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or concerns:
            </p>
            <div className="mt-3 bg-card border border-border rounded-xl p-5 space-y-2 text-sm">
              <p><strong className="text-foreground">{COMPANY}</strong></p>
              <p className="text-muted-foreground">Email: <span className="text-primary">{EMAIL}</span></p>
              <p className="text-muted-foreground">Website: <span className="text-primary">{WEBSITE}</span></p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY}. TwilioHub OSS is MIT Licensed.</p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors font-medium text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
