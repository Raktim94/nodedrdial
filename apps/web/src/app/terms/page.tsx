import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — TwilioHub OSS',
  description: 'Terms of Service for TwilioHub OSS communications platform by Nodedr Infotech Pvt Ltd.',
};

const EFFECTIVE_DATE = 'January 1, 2025';
const COMPANY = 'Nodedr Infotech Pvt Ltd';
const WEBSITE = 'www.nodedr.com';
const EMAIL = 'legal@nodedr.com';

export default function TermsPage() {
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Effective Date: {EFFECTIVE_DATE}</p>
        </div>

        <div className="space-y-8 text-foreground">

          <section className="bg-warning/10 border border-warning/30 rounded-xl p-5 text-sm text-warning">
            <strong>Important:</strong> TwilioHub OSS is open-source software provided under the MIT License. These Terms govern any Nodedr-operated services. If you self-host TwilioHub OSS, the MIT License terms apply directly.
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By downloading, installing, or using TwilioHub OSS, you agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree, do not use the software.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              These terms apply to: (a) the TwilioHub OSS software distributed under the MIT License, and (b) any cloud or managed services offered by {COMPANY} using this software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Open Source License</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS is licensed under the <strong className="text-foreground">MIT License</strong>. You are free to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2 mt-3">
              <li>Use the software for any purpose, including commercial use</li>
              <li>Copy, modify, and distribute the software</li>
              <li>Incorporate it into proprietary products</li>
              <li>Sublicense it</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              The only requirement is that the original MIT License and copyright notice (<strong className="text-foreground">© {COMPANY}</strong>) must be included in all copies or substantial portions of the software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Permitted Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree to use TwilioHub OSS only for lawful purposes and in compliance with:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>All applicable local, national, and international laws</li>
              <li>Twilio's Acceptable Use Policy (<span className="text-primary">twilio.com/legal/aup</span>)</li>
              <li>Applicable telecommunications regulations in your jurisdiction</li>
              <li>Anti-spam laws (e.g., CAN-SPAM Act, CASL, GDPR)</li>
              <li>TCPA requirements for SMS marketing in the United States</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Prohibited Uses</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You must not use TwilioHub OSS to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>Send unsolicited commercial messages (spam) to people who have not opted in</li>
              <li>Send messages that harass, threaten, or abuse individuals</li>
              <li>Impersonate any person, company, or organization</li>
              <li>Engage in phishing or social engineering attacks</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Violate any third party's privacy, intellectual property, or other rights</li>
              <li>Conduct or enable illegal surveillance or interception of communications</li>
              <li>Circumvent or disable security features of the software</li>
              <li>Use the platform for any activity that violates Twilio's terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Responsibilities as a Self-Hoster</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">If you deploy TwilioHub OSS on your own infrastructure, you are solely responsible for:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>Securing your deployment (keeping secrets, enabling HTTPS, firewall rules)</li>
              <li>Keeping the software updated to receive security patches</li>
              <li>Backing up your data</li>
              <li>Complying with all applicable laws for your jurisdiction and use case</li>
              <li>Maintaining your own privacy policy for your users</li>
              <li>Managing Twilio account costs and usage</li>
              <li>Ensuring proper consent from contacts before sending SMS</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Twilio Integration</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS requires a separate Twilio account. Your use of Twilio is governed by Twilio's own Terms of Service and you are responsible for all Twilio usage costs incurred through your TwilioHub instance. {COMPANY} is not responsible for Twilio charges, account suspensions, or service disruptions from Twilio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, {COMPANY} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of TwilioHub OSS, even if {COMPANY} has been advised of the possibility of such damages.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Our total liability for any claims related to TwilioHub OSS shall not exceed the amount you paid to {COMPANY} in the 12 months preceding the claim (which, for the open-source software, is $0).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless {COMPANY}, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorney's fees) arising from your use of TwilioHub OSS, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              TwilioHub OSS and the "Nodedr" and "TwilioHub" names are owned by {COMPANY}. The MIT License grants you rights to the software code, but does not grant you rights to use our trademarks, logos, or brand names in ways that imply endorsement or affiliation without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will post the updated Terms in the project repository and update the effective date. Your continued use of the software after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For legal inquiries regarding these Terms:</p>
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">Terms of Service</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors">Accessibility</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
