import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Briefcase,
  Sparkles,
  Trophy,
  Target,
  Heart,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Student Internships',
  description: 'Internship opportunities for students at National Bank of Canada',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-20 overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/">
            <button className="btn-game-secondary text-sm px-4 py-2 mb-6">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Arena
            </button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Users className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Student Internships
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Launch your career at National Bank of Canada! Join our internship program and gain
            real-world experience in finance, tech, and innovation.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Why Join */}
          <div className="game-card p-8">
            <h2 className="text-3xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Trophy className="w-8 h-8 text-primary animate-wiggle" />
              Why Intern at NBC?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-6 h-6 text-primary group-hover:animate-wiggle" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Real Impact</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Work on real projects that impact millions of customers across Canada's banking
                  sector!
                </p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-6 h-6 text-accent group-hover:animate-sparkle" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Learn & Grow</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Gain hands-on experience with cutting-edge technologies and mentorship from
                  industry experts!
                </p>
              </div>
              <div className="group">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-6 h-6 text-accent2 group-hover:animate-float" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Career Launch</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  Build your professional network and launch your career at one of Canada's leading
                  banks!
                </p>
              </div>
            </div>
          </div>

          {/* Available Roles */}
          <div>
            <h2 className="text-4xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Briefcase className="w-10 h-10 text-primary animate-wiggle" />
              Internship Opportunities
            </h2>
            <div className="space-y-4">
              {/* Software Engineering Intern */}
              <div className="game-card p-6 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-black mb-3 text-slate-900 dark:text-slate-100">
                      Software Engineering Intern
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300 font-bold mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Montreal / Toronto
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        4-12 months
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent2" />
                        Technology
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 leading-relaxed">
                      Build innovative banking applications using Java, Python, React, and cloud
                      technologies. Work alongside experienced engineers on projects that serve
                      millions of customers.
                    </p>
                  </div>
                </div>
                <button disabled className="btn-game-secondary opacity-50 cursor-not-allowed">
                  <Zap className="inline w-5 h-5 mr-2" />
                  Applications Open January 2026
                </button>
              </div>

              {/* Data Science Intern */}
              <div className="game-card p-6 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-black mb-3 text-slate-900 dark:text-slate-100">Data Science Intern</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300 font-bold mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Montreal
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        4-8 months
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent2" />
                        Analytics
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 leading-relaxed">
                      Apply machine learning and data analytics to solve real banking challenges.
                      Work with Python, SQL, and modern ML frameworks to uncover insights from
                      financial data.
                    </p>
                  </div>
                </div>
                <button disabled className="btn-game-secondary opacity-50 cursor-not-allowed">
                  <Zap className="inline w-5 h-5 mr-2" />
                  Applications Open January 2026
                </button>
              </div>

              {/* Cybersecurity Intern */}
              <div className="game-card p-6 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-black mb-3 text-slate-900 dark:text-slate-100">Cybersecurity Intern</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300 font-bold mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Montreal / Toronto
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        4-12 months
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent2" />
                        Security
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 leading-relaxed">
                      Protect our customers and systems from cyber threats. Work on security
                      assessments, threat detection, and incident response alongside our expert
                      security team.
                    </p>
                  </div>
                </div>
                <button disabled className="btn-game-secondary opacity-50 cursor-not-allowed">
                  <Zap className="inline w-5 h-5 mr-2" />
                  Applications Open January 2026
                </button>
              </div>

              {/* Business Analyst Intern */}
              <div className="game-card p-6 group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-black mb-3 text-slate-900 dark:text-slate-100">
                      Business Analyst Intern
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300 font-bold mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Montreal
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        4-8 months
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-accent2" />
                        Finance
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 leading-relaxed">
                      Bridge the gap between technology and business. Analyze processes, gather
                      requirements, and help design solutions that improve banking operations.
                    </p>
                  </div>
                </div>
                <button disabled className="btn-game-secondary opacity-50 cursor-not-allowed">
                  <Zap className="inline w-5 h-5 mr-2" />
                  Applications Open January 2026
                </button>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="game-card p-8 text-center group">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4 group-hover:animate-wiggle" />
            <h3 className="text-3xl font-display font-black mb-4 text-slate-900 dark:text-slate-100">Ready to Apply?</h3>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mb-6 max-w-2xl mx-auto leading-relaxed">
              Internship applications open in January 2026. Submit your resume and tell us why you
              want to intern at National Bank of Canada!
            </p>
            <a href="mailto:internships@nbc.ca">
              <button className="btn-game">
                <Users className="inline w-5 h-5 mr-2" />
                Apply for Internship
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
