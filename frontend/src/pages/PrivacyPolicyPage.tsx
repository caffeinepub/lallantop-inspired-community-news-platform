import React from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, ChevronRight } from 'lucide-react';

const sections = [
  {
    number: '1',
    title: 'Introduction',
    content: `Global Nexus is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information. By using our platform, you agree to the practices described here.`,
  },
  {
    number: '2',
    title: 'Data Collection',
    bullets: [
      'We collect only the information you choose to provide (e.g., when signing up, submitting reports, or engaging with content).',
      'Technical data such as browser type, device, and usage patterns may be collected to improve site performance.',
      'No sensitive personal data is collected without explicit consent.',
    ],
  },
  {
    number: '3',
    title: 'User Consent',
    bullets: [
      'Your data is used only with your explicit permission.',
      'You will always be informed about what data is being collected and why.',
      'You may withdraw consent at any time, and we will stop using your data immediately.',
    ],
  },
  {
    number: '4',
    title: 'Data Usage',
    bullets: [
      'Data is used to personalize your experience, improve services, and support community engagement.',
      'Analytics may be performed internally to understand trends and enhance platform features.',
      'We do not sell, rent, or share your data with third parties.',
    ],
  },
  {
    number: '5',
    title: 'Legal Compliance',
    bullets: [
      'Global Nexus adheres to the Information Technology Act, 2000 (India) and other relevant data protection regulations.',
      'We ensure that your privacy is protected both by our standards and by applicable law.',
    ],
  },
  {
    number: '6',
    title: 'Data Security',
    bullets: [
      'We use encryption, secure servers, and regular monitoring to protect your information.',
      'Access to user data is restricted to authorized personnel only.',
      'In case of a breach, we will notify affected users promptly and take corrective measures.',
    ],
  },
  {
    number: '7',
    title: 'User Rights',
    bullets: [
      'You have the right to access, correct, or delete your personal data.',
      'You may request a copy of the data you have shared with us.',
      'You may opt out of communications or withdraw consent at any time.',
    ],
  },
  {
    number: '8',
    title: 'Transparency & Updates',
    bullets: [
      'Any changes to this policy will be communicated clearly on our website.',
      'We encourage users to review this policy periodically to stay informed.',
      'Questions or concerns can be directed to our support team via the contact page.',
    ],
  },
  {
    number: '9',
    title: 'Contact',
    content: `If you have any questions about this Privacy Policy or how your data is handled, please contact us through the official Global Nexus support channel.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-news-charcoal py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield size={18} className="text-news-blue-light" />
            <span className="text-news-blue-light text-xs font-black uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="font-headline font-black text-white text-3xl md:text-4xl mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            How Global Nexus collects, uses, and protects your information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden mb-8">
          <div className="border-l-4 border-news-blue px-6 py-4 bg-news-blue/5">
            <p className="text-sm text-foreground/70 leading-relaxed">
              <strong className="text-foreground">Effective Date:</strong> This Privacy Policy applies to all users of the Global Nexus platform. By accessing or using our services, you acknowledge that you have read and understood this policy.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.number}
              className="bg-card border border-border rounded-lg p-6 shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-news-blue flex items-center justify-center">
                  <span className="text-white text-xs font-black">{section.number}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-headline font-black text-lg text-foreground mb-3">
                    {section.title}
                  </h2>
                  {section.content && (
                    <p className="text-sm text-foreground/75 leading-relaxed">{section.content}</p>
                  )}
                  {section.bullets && (
                    <ul className="space-y-2">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/75 leading-relaxed">
                          <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-news-blue" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-news-charcoal rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-headline font-black text-white text-lg mb-1">
              Questions about your privacy?
            </h3>
            <p className="text-white/60 text-sm">
              Contact the Global Nexus support team through our official channel.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 bg-news-blue hover:bg-news-blue-dark text-white font-bold text-sm px-5 py-2.5 rounded transition-colors whitespace-nowrap"
          >
            Back to Homepage
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
