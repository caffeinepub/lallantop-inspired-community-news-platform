import React from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, ChevronRight, Mail, Globe } from 'lucide-react';

const sections = [
  {
    number: '1',
    title: 'Acceptance of Terms',
    content: `By accessing or using Global Nexus, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform.`,
  },
  {
    number: '2',
    title: 'User Responsibilities',
    bullets: [
      'You agree to provide accurate information when registering or submitting content.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You agree not to misuse the platform for unlawful, harmful, or misleading purposes.',
    ],
  },
  {
    number: '3',
    title: 'Content Submission',
    bullets: [
      'Users may submit articles, reports, multimedia, and comments.',
      'By submitting content, you grant Global Nexus a non-exclusive license to display, distribute, and promote your contributions.',
      'You retain ownership of your content, but you are responsible for ensuring it does not violate copyright, privacy, or applicable laws.',
    ],
  },
  {
    number: '4',
    title: 'Community Standards',
    bullets: [
      'Respectful dialogue is expected at all times.',
      'Hate speech, harassment, or misinformation is strictly prohibited.',
      'Global Nexus reserves the right to remove content or suspend accounts that violate these standards.',
    ],
  },
  {
    number: '5',
    title: 'Platform Use',
    bullets: [
      'The platform is provided "as is," without guarantees of uninterrupted service.',
      'We may update, modify, or discontinue features at any time.',
      'Users agree not to attempt unauthorized access, reverse engineering, or disruption of services.',
    ],
  },
  {
    number: '6',
    title: 'Data & Privacy',
    bullets: [
      'Use of the platform is subject to our Privacy Policy.',
      'We collect and use data only with user consent and do not share data with third parties.',
      'Users may withdraw consent at any time.',
    ],
  },
  {
    number: '7',
    title: 'Legal Compliance',
    bullets: [
      'Global Nexus operates in accordance with the Information Technology Act, 2000 (India) and other applicable laws.',
      'Users are responsible for ensuring their activities comply with local regulations.',
    ],
  },
  {
    number: '8',
    title: 'Limitation of Liability',
    bullets: [
      'Global Nexus is not liable for damages arising from user content, technical issues, or third-party actions.',
      'Users assume responsibility for their interactions and reliance on information shared through the platform.',
    ],
  },
  {
    number: '9',
    title: 'Termination',
    bullets: [
      'We reserve the right to suspend or terminate accounts that violate these Terms.',
      'Users may request account deletion at any time.',
    ],
  },
  {
    number: '10',
    title: 'Updates to Terms',
    bullets: [
      'These Terms may be updated periodically.',
      'Continued use of the platform after changes indicates acceptance of the revised Terms.',
    ],
  },
  {
    number: '11',
    title: 'Contact',
    content: `For questions or concerns regarding these Terms, please contact us at pawneshkumarsingh@globalnexus.co.in or visit our website at https://globalnexus.co.in`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-news-charcoal py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <FileText size={18} className="text-news-blue-light" />
            <span className="text-news-blue-light text-xs font-black uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="font-headline font-black text-white text-3xl md:text-4xl mb-3">
            Terms of Service
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            The rules and guidelines governing your use of the Global Nexus platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden mb-8">
          <div className="border-l-4 border-news-blue px-6 py-4 bg-news-blue/5">
            <p className="text-sm text-foreground/70 leading-relaxed">
              <strong className="text-foreground">Effective Date:</strong> These Terms of Service govern your access to and use of the Global Nexus platform. By using our services, you agree to be bound by these terms.
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
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-foreground/75 leading-relaxed">
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
              Questions about our Terms?
            </h3>
            <div className="flex flex-col gap-1 mt-1">
              <a
                href="mailto:pawneshkumarsingh@globalnexus.co.in"
                className="flex items-center gap-1.5 text-news-blue-light hover:text-white text-sm transition-colors"
              >
                <Mail size={13} />
                pawneshkumarsingh@globalnexus.co.in
              </a>
              <a
                href="https://globalnexus.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-news-blue-light hover:text-white text-sm transition-colors"
              >
                <Globe size={13} />
                globalnexus.co.in
              </a>
            </div>
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
