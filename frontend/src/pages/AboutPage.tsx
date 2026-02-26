import React from 'react';
import { Link } from '@tanstack/react-router';
import { Globe, BookOpen, MapPin, Award, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-news-charcoal py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe size={18} className="text-news-blue-light" />
            <span className="text-news-blue-light text-xs font-black uppercase tracking-widest">
              About Global Nexus
            </span>
          </div>
          <h1 className="font-headline font-black text-white text-3xl md:text-4xl mb-3">
            Meet Our Founder
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            The visionary behind Global Nexus — a platform where local voices meet global narratives.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Founder card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-10">
          <div className="md:flex">
            {/* Photo */}
            <div className="md:w-72 flex-shrink-0">
              <img
                src="/assets/WhatsApp Image 2026-02-17 at 2.19.48 PM (1).jpeg"
                alt="Pawnesh Kumar Singh — Founder & CEO, Global Nexus"
                className="w-full h-72 md:h-full object-cover object-top"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-72 md:h-full bg-news-blue/10 flex items-center justify-center"><span class="text-news-blue/40 text-6xl font-black">PK</span></div>`;
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="mb-1">
                <span className="inline-block bg-news-blue/10 text-news-blue text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm mb-3">
                  Founder & CEO
                </span>
              </div>
              <h2 className="font-headline font-black text-2xl md:text-3xl text-foreground mb-1">
                Pawnesh Kumar Singh
              </h2>
              <p className="text-news-blue font-semibold text-sm mb-4">Global Nexus</p>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-news-blue" />
                  M.A. Geography — Climate Resilience
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-news-blue" />
                  India
                </span>
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-news-blue" />
                  Strategic Communicator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio section */}
        <div className="prose prose-sm max-w-none">
          <div className="border-l-4 border-news-blue pl-5 mb-8">
            <h3 className="font-headline font-black text-xl text-foreground mb-0">
              About Pawnesh Kumar Singh
            </h3>
            <p className="text-news-blue text-sm font-semibold mt-1">
              Visionary Founder & CEO of Global Nexus
            </p>
          </div>

          <div className="space-y-5 text-foreground/80 text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">Pawnesh Kumar Singh</strong> is the visionary Founder and CEO of Global Nexus, a multilingual news and policy platform dedicated to empowering communities through real-time reporting, AI-driven analysis, and citizen engagement. With a Master's degree in Geography and a specialization in climate resilience, Pawnesh brings a multidisciplinary lens to global development, public policy, and child-centered advocacy.
            </p>

            <p>
              He is a strategic communicator known for his analytical rigor, cross-cultural fluency, and commitment to equity-focused solutions. Through Global Nexus, Pawnesh merges grassroots reporting with cutting-edge technology — creating a space where local voices meet global narratives.
            </p>

            <p>
              His experience spans research on child trafficking, climate migration, and constitutional ethics, and he has authored influential articles and led community mapping initiatives.
            </p>

            <p>
              Pawnesh's leadership reflects a deep belief in inclusive journalism, civic empowerment, and the transformative power of information. Under his guidance, Global Nexus is not just a news platform — it's a movement for transparency, dialogue, and sustainable change.
            </p>
          </div>
        </div>

        {/* Key focus areas */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Globe size={20} className="text-news-blue" />,
              title: 'Global Perspective',
              desc: 'Connecting local stories to global narratives through multilingual reporting.',
            },
            {
              icon: <BookOpen size={20} className="text-news-blue" />,
              title: 'Research & Policy',
              desc: 'Deep expertise in climate resilience, child advocacy, and constitutional ethics.',
            },
            {
              icon: <Award size={20} className="text-news-blue" />,
              title: 'Civic Empowerment',
              desc: 'Building platforms that amplify citizen voices and drive transparent dialogue.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5">
              <div className="mb-3">{item.icon}</div>
              <h4 className="font-headline font-bold text-sm text-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-news-charcoal rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-headline font-black text-white text-lg mb-1">
              Explore Global Nexus
            </h3>
            <p className="text-white/60 text-sm">
              Stay informed with real-time reporting, citizen journalism, and multimedia content.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 bg-news-blue hover:bg-news-blue-dark text-white font-bold text-sm px-5 py-2.5 rounded transition-colors whitespace-nowrap"
          >
            Visit Homepage
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
