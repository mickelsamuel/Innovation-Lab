import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  ArrowRight,
  Scroll,
  Trophy,
  Megaphone,
  Swords,
  Target,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Battle Chronicles',
  description: 'Latest news, victory stories, and epic tales from the arena!',
};

export default function BlogPage() {
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
            <BookOpen className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Battle Chronicles
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Latest news, victory stories, and epic tales from the arena!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Coming Soon */}
          <div className="game-card p-16 text-center mb-12">
            <Scroll className="w-20 h-20 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-4xl font-display font-black mb-4">Gathering Intel...</h2>
            <p className="text-slate-700 font-semibold mb-6 max-w-md mx-auto leading-relaxed">
              We're preparing legendary chronicles about raids, boss battles, and developer
              innovation stories!
            </p>
            <p className="text-slate-700 font-semibold mb-8 max-w-md mx-auto leading-relaxed">
              In the meantime, stay updated by exploring active raids and challenging epic bosses!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/hackathons">
                <button className="btn-game">
                  <Swords className="inline w-5 h-5 mr-2" />
                  Explore Raids
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>
              </Link>
              <Link href="/challenges">
                <button className="btn-game-secondary">
                  <Target className="inline w-5 h-5 mr-2" />
                  View Bosses
                  <ArrowRight className="inline w-5 h-5 ml-2" />
                </button>
              </Link>
            </div>
          </div>

          {/* Preview of what's coming */}
          <div>
            <h2 className="text-3xl font-display font-black mb-6 flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary animate-sparkle" />
              What to Expect
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Strategy Guides */}
              <div className="game-card p-6 group">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-8 h-8 text-primary group-hover:animate-wiggle" />
                  <h3 className="text-xl font-display font-black">Strategy Guides</h3>
                </div>
                <p className="text-slate-700 font-semibold leading-relaxed">
                  Step-by-step battle plans for building innovative projects, dominating raids, and
                  mastering new technologies!
                </p>
              </div>

              {/* Victory Chronicles */}
              <div className="game-card p-6 group">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-accent group-hover:animate-wiggle" />
                  <h3 className="text-xl font-display font-black">Victory Chronicles</h3>
                </div>
                <p className="text-slate-700 font-semibold leading-relaxed">
                  Interviews with legendary guilds, their winning strategies, and how they built
                  their award-winning conquests!
                </p>
              </div>

              {/* Arena Updates */}
              <div className="game-card p-6 group">
                <div className="flex items-center gap-3 mb-4">
                  <Megaphone className="w-8 h-8 text-accent2 group-hover:animate-wiggle" />
                  <h3 className="text-xl font-display font-black">Arena Updates</h3>
                </div>
                <p className="text-slate-700 font-semibold leading-relaxed">
                  New features, legendary improvements, and announcements about arena expansions and
                  upcoming epic raids!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
