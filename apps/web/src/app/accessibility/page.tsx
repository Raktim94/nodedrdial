import Link from 'next/link';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Accessibility Statement — TwilioHub OSS',
  description: 'Accessibility commitment and statement for TwilioHub OSS by Nodedr Infotech Pvt Ltd.',
};

const LAST_REVIEW = 'January 2025';
const COMPANY = 'Nodedr Infotech Pvt Ltd';
const EMAIL = 'accessibility@nodedr.com';
const WEBSITE = 'www.nodedr.com';

export default function AccessibilityPage() {
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
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Accessibility Statement</h1>
          <p className="text-muted-foreground">Last reviewed: {LAST_REVIEW}</p>
        </div>

        <div className="space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{COMPANY}</strong> is committed to ensuring TwilioHub OSS is accessible to all users, including those with disabilities. We strive to conform to the <strong className="text-foreground">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards as published by the World Wide Web Consortium (W3C).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              As an open-source project, we welcome community contributions to improve accessibility. If you identify an accessibility barrier, please open an issue or submit a pull request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Conformance Status</h2>
            <p className="text-muted-foreground leading-relaxed mb-5">
              TwilioHub OSS is <strong className="text-foreground">partially conformant</strong> with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard. We are actively working to address known gaps.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* What works */}
              <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> What We've Done
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Semantic HTML throughout (proper heading hierarchy h1→h2→h3)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> All interactive elements are keyboard navigable (Tab, Enter, Space, Escape)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> ARIA labels on icon-only buttons and controls</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Visible focus indicators on all interactive elements</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Color contrast ratios meet WCAG AA (4.5:1 for normal text)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Form fields have associated labels</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Error messages are programmatically associated with fields</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> No auto-playing audio or video</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Status messages announced via live regions</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Responsive design — works at 320px wide and up to 400% text zoom</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" /> Respects prefers-reduced-motion media query</li>
                </ul>
              </div>

              {/* Known issues */}
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
                <h3 className="font-semibold text-warning mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Known Limitations
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" /> Data tables lack full ARIA grid role implementation (planned)</li>
                  <li className="flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" /> Recharts analytics charts have limited screen reader descriptions (planned)</li>
                  <li className="flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" /> Modal dialogs do not always trap focus on older browsers</li>
                  <li className="flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" /> Browser softphone (WebRTC) component accessibility is limited by browser support</li>
                  <li className="flex items-start gap-2"><AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" /> CSV import/export workflow lacks full keyboard navigation</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Supported Assistive Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">TwilioHub OSS has been tested with the following assistive technologies:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { category: 'Screen Readers', tools: ['NVDA + Chrome (Windows)', 'JAWS + Chrome (Windows)', 'VoiceOver + Safari (macOS)', 'VoiceOver + Safari (iOS)'] },
                { category: 'Keyboard Navigation', tools: ['Chrome', 'Firefox', 'Safari', 'Edge'] },
                { category: 'Magnification', tools: ['Windows Magnifier', 'macOS Zoom', 'Browser zoom to 400%', 'ZoomText'] },
              ].map((group) => (
                <div key={group.category} className="bg-card border border-border rounded-xl p-4">
                  <h3 className="font-medium text-foreground text-sm mb-3">{group.category}</h3>
                  <ul className="space-y-1.5">
                    {group.tools.map((tool) => (
                      <li key={tool} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Keyboard Shortcuts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">TwilioHub OSS is fully navigable using a keyboard:</p>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-5 py-3 font-medium text-foreground">Key</th>
                    <th className="text-left px-5 py-3 font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['Tab', 'Move to next focusable element'],
                    ['Shift + Tab', 'Move to previous focusable element'],
                    ['Enter / Space', 'Activate buttons and links'],
                    ['Escape', 'Close modals and dropdowns'],
                    ['Arrow Keys', 'Navigate within menus and select controls'],
                    ['Enter (in message input)', 'Send a message'],
                    ['Shift + Enter (in message input)', 'Insert a new line without sending'],
                  ].map(([key, action]) => (
                    <tr key={key} className="hover:bg-accent transition-colors">
                      <td className="px-5 py-3">
                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground">{key}</code>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Technical Specifications</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">TwilioHub OSS relies on the following technologies for accessibility:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
              <li>HTML5 semantic elements (nav, main, header, footer, article, section)</li>
              <li>WAI-ARIA 1.1 roles, states, and properties</li>
              <li>CSS media queries (prefers-reduced-motion, prefers-color-scheme)</li>
              <li>Native browser focus management</li>
              <li>SVG icons with aria-hidden and accompanying text labels</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Feedback and Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              We actively seek feedback to improve accessibility. If you encounter a barrier that prevents you from using any part of TwilioHub OSS, we want to know.
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-medium text-foreground mb-2">Open a GitHub Issue</h3>
                <p className="text-sm text-muted-foreground">
                  For open-source users, the fastest way is to open an issue on our GitHub repository tagged with <code className="text-primary text-xs font-mono bg-muted px-1 py-0.5 rounded">accessibility</code>.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-medium text-foreground mb-2">Email Us</h3>
                <p className="text-sm text-muted-foreground">
                  Email <strong className="text-primary">{EMAIL}</strong> describing the barrier and what assistive technology you use. We aim to respond within 5 business days.
                </p>
              </div>
            </div>

            <div className="mt-5 bg-card border border-border rounded-xl p-5 space-y-2 text-sm">
              <p><strong className="text-foreground">{COMPANY}</strong></p>
              <p className="text-muted-foreground">Accessibility email: <span className="text-primary">{EMAIL}</span></p>
              <p className="text-muted-foreground">Website: <span className="text-primary">{WEBSITE}</span></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Formal Complaints</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim to respond to accessibility feedback within 5 business days and resolve issues within 30 days. If you are not satisfied with our response, you may contact relevant enforcement authorities in your country. In the EU, this would be your national accessibility authority. In the US, this would be the Department of Justice Civil Rights Division.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY}. TwilioHub OSS is MIT Licensed.</p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/accessibility" className="hover:text-foreground transition-colors font-medium text-foreground">Accessibility</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
