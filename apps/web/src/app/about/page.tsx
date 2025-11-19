import Link from 'next/link';
import { ArrowLeft, Building2, Target, Users, Zap, Trophy, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'About The Arena',
  description:
    'Learn about Innovation Lab - the ultimate gaming platform for developers to compete, level up, and claim victory!',
};

export default function AboutPage() {
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
            <Trophy className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              About The Arena
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            The ultimate competitive platform where developers level up, compete in raids, and claim
            legendary status!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Mission */}
          <div className="game-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-primary animate-wiggle" />
              <h2 className="text-3xl font-display font-black">Our Quest</h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              Innovation Lab is a platform designed to bring together developers, designers, and
              innovators to collaborate on cutting-edge projects. We host hackathons, coding
              challenges, and provide a space for the tech community to learn, grow, and build
              together.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="game-card p-6">
              <Building2 className="w-12 h-12 text-primary mb-3 animate-wiggle" />
              <h3 className="text-xl font-display font-black mb-3">Innovation First</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We encourage creative thinking and pushing boundaries to solve real-world problems.
              </p>
            </div>

            <div className="game-card p-6">
              <Users className="w-12 h-12 text-accent2 mb-3 animate-wiggle" />
              <h3 className="text-xl font-display font-black mb-3">Community Driven</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our platform thrives on collaboration, knowledge sharing, and supporting each
                other's growth.
              </p>
            </div>

            <div className="game-card p-6">
              <Zap className="w-12 h-12 text-accent mb-3 animate-wiggle" />
              <h3 className="text-xl font-display font-black mb-3">Excellence</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We strive for quality in everything we do, from code to community engagement.
              </p>
            </div>
          </div>

          {/* Partnership */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-4">
              Partnership with NBC & Vaultix
            </h2>
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Innovation Lab is proudly built in partnership with the National Bank of Canada
                (NBC) and Vaultix, bringing together financial technology expertise and innovation
                platforms to create opportunities for developers worldwide.
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                This collaboration aims to foster innovation in the fintech space while providing
                developers with real-world challenges and opportunities to showcase their skills.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="game-card p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="text-2xl font-display font-black mb-4">Join Our Community</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Whether you're a seasoned developer or just starting out, Innovation Lab welcomes you.
              Join hackathons, tackle challenges, and be part of something bigger.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/hackathons">
                <button className="btn-game px-6 py-3">Explore Hackathons</button>
              </Link>
              <Link href="/challenges">
                <button className="btn-game-secondary px-6 py-3">View Challenges</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
