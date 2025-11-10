import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Book,
  HelpCircle,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'Support HQ',
  description: 'Need backup? Our support guild is here to help you dominate the arena!',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen hex-grid">
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
            <Shield className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Support HQ
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Need backup? Our support guild is ready to assist you on your journey!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="game-card p-8 group">
              <Mail className="w-12 h-12 text-primary mb-4 group-hover:animate-wiggle" />
              <h2 className="text-2xl font-display font-black mb-3">Request Aid</h2>
              <p className="text-slate-700 font-semibold mb-6">
                Need help? Send us a message and we'll respond within 24 hours!
              </p>
              <a href="mailto:support@innovationlab.com" className="btn-game">
                <Mail className="inline w-5 h-5 mr-2" />
                Contact Support
              </a>
            </div>

            <div className="game-card p-8 group">
              <MessageCircle className="w-12 h-12 text-accent2 mb-4 group-hover:animate-wiggle" />
              <h2 className="text-2xl font-display font-black mb-3">Guild Chat</h2>
              <p className="text-slate-700 font-semibold mb-6">
                Join community discussions and get help from fellow players!
              </p>
              <button className="btn-game-secondary opacity-50 cursor-not-allowed" disabled>
                <Zap className="inline w-5 h-5 mr-2" />
                Coming Soon
              </button>
            </div>

            <div className="game-card p-8 group">
              <Book className="w-12 h-12 text-accent mb-4 group-hover:animate-wiggle" />
              <h2 className="text-2xl font-display font-black mb-3">Battle Manual</h2>
              <p className="text-slate-700 font-semibold mb-6">
                Browse comprehensive guides and documentation!
              </p>
              <button className="btn-game-secondary opacity-50 cursor-not-allowed" disabled>
                <Book className="inline w-5 h-5 mr-2" />
                Coming Soon
              </button>
            </div>

            <div className="game-card p-8 group">
              <HelpCircle className="w-12 h-12 text-green-500 mb-4 group-hover:animate-wiggle" />
              <h2 className="text-2xl font-display font-black mb-3">Quick Answers</h2>
              <p className="text-slate-700 font-semibold mb-6">
                Find answers to commonly asked questions!
              </p>
              <Link href="/faq">
                <button className="btn-game">
                  <HelpCircle className="inline w-5 h-5 mr-2" />
                  View FAQ
                </button>
              </Link>
            </div>
          </div>

          <div className="game-card p-8">
            <h2 className="text-3xl font-display font-black mb-6 flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary animate-sparkle" />
              Quick Guides
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">How do I join a raid?</h3>
                <p className="text-slate-700 font-semibold">
                  Browse available raids, click on one that interests you, and hit "Join Raid" to
                  enter the battle!
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">How do I submit a quest?</h3>
                <p className="text-slate-700 font-semibold">
                  After joining a guild for a raid, navigate to the raid page and click "Submit
                  Quest" to upload your team's work!
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">
                  How does the XP system work?
                </h3>
                <p className="text-slate-700 font-semibold">
                  You earn XP by participating in raids, defeating bosses, and contributing to your
                  guild. XP helps you level up and unlock legendary trophies!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
