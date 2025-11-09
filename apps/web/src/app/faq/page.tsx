import Link from 'next/link';
import { ArrowLeft, HelpCircle, Sparkles, Zap, Swords, Skull, Trophy, Target, Shield, User } from 'lucide-react';

export const metadata = {
  title: 'Battle Manual (FAQ)',
  description: 'Everything you need to dominate the arena!',
};

const faqs = [
  {
    category: 'Beginner\'s Quest',
    icon: Target,
    questions: [
      {
        q: 'What is Innovation Lab?',
        a: 'Innovation Lab is the ultimate arena for virtual raids and boss challenges. It brings together developers to collaborate, compete, and dominate real-world coding battles!',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Join Arena" in the top navigation, fill in your player details, and verify your email address to begin your legendary journey!',
      },
      {
        q: 'Is Innovation Lab free to use?',
        a: 'Absolutely! Innovation Lab is completely free for all players. Join raids, defeat bosses, and earn XP without any cost!',
      },
    ],
  },
  {
    category: 'Raid Mechanics',
    icon: Swords,
    questions: [
      {
        q: 'How do I join a raid?',
        a: 'Browse the Raid Selection page, find an epic raid that interests you, and click "Enter Raid". You\'ll then need to create or join a guild to participate!',
      },
      {
        q: 'Can I participate alone or do I need a guild?',
        a: 'Most raids require guilds. You can create your own guild or join an existing one through the Guild Finder to team up with legendary developers!',
      },
      {
        q: 'How many members can be in a guild?',
        a: 'Guild size limits vary by raid. Check the specific raid details for maximum guild size (typically 2-5 members).',
      },
      {
        q: 'How do I submit my quest?',
        a: 'Once your guild is ready, go to the raid page and click "Submit Quest". Fill in your project details, add links to your repository and demo, and complete the quest!',
      },
      {
        q: 'Can I update my submission after submitting?',
        a: 'Yes, you can edit your quest submission while it\'s in draft status. Once finalized by the guild leader, submissions are locked!',
      },
    ],
  },
  {
    category: 'Boss Fight Guide',
    icon: Skull,
    questions: [
      {
        q: 'What are boss challenges?',
        a: 'Boss challenges are individual coding encounters that you can tackle solo at your own pace. Defeat bosses to improve your skills and earn massive XP!',
      },
      {
        q: 'Do boss challenges have deadlines?',
        a: 'Some bosses have time limits, while others are available indefinitely. Check the boss intel for specific information.',
      },
      {
        q: 'How are boss challenge submissions reviewed?',
        a: 'Challenge owners review your performance based on defined victory criteria. You\'ll receive feedback and a score once the boss has been evaluated!',
      },
    ],
  },
  {
    category: 'XP & Progression System',
    icon: Trophy,
    questions: [
      {
        q: 'How do I earn XP?',
        a: 'You earn XP by participating in raids, defeating bosses, forming guilds, completing your player profile, maintaining login streaks, and achieving legendary milestones!',
      },
      {
        q: 'What are levels and how do they work?',
        a: 'As you accumulate XP, you level up and rise through the ranks! Higher levels unlock special trophies and showcase your legendary status on the platform!',
      },
      {
        q: 'How do I earn trophies?',
        a: 'Trophies are awarded automatically when you complete epic achievements, such as winning raids, maintaining streaks, or reaching legendary milestones!',
      },
      {
        q: 'What are Vault Keys?',
        a: 'Vault Keys are special virtual currency earned through exceptional achievements. They unlock exclusive loot and legendary features!',
      },
    ],
  },
  {
    category: 'Scoring & Victory',
    icon: Zap,
    questions: [
      {
        q: 'How are raid submissions judged?',
        a: 'Assigned judges score each quest based on predefined criteria (e.g., innovation, technical prowess, presentation). Scores are weighted and aggregated to determine the Hall of Fame rankings!',
      },
      {
        q: 'Can I see my scores?',
        a: 'Yes! Once judging is complete, you can view your guild\'s detailed scores and battle feedback on your submission page.',
      },
      {
        q: 'Who can be a judge?',
        a: 'Judges are typically selected by raid organizers. If you\'re interested in judging battles, contact the organizer or platform administrators!',
      },
    ],
  },
  {
    category: 'Player Profile',
    icon: User,
    questions: [
      {
        q: 'How do I update my profile?',
        a: 'Click on your avatar in the top navigation and select "Player Profile" to edit your information, avatar, and legendary bio!',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the Enter Arena page, enter your email, and follow the instructions sent to your inbox.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, contact Support HQ at support@innovationlab.com to request account deletion.',
      },
    ],
  },
];

export default function FAQPage() {
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
            <HelpCircle className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Battle Manual
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Everything you need to dominate the arena and become a legendary developer!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((category, idx) => {
            const IconComponent = category.icon;
            return (
              <div key={idx} className="game-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <IconComponent className="w-8 h-8 text-primary animate-wiggle" />
                  <h2 className="text-3xl font-display font-black">{category.category}</h2>
                </div>
                <div className="space-y-6">
                  {category.questions.map((faq, qIdx) => (
                    <div key={qIdx} className="border-l-4 border-primary pl-4 hover:border-accent transition-colors">
                      <h3 className="font-bold text-lg mb-2 text-slate-900">{faq.q}</h3>
                      <p className="text-slate-700 font-semibold leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Support CTA */}
          <div className="game-card p-8 text-center group">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4 group-hover:animate-wiggle" />
            <h3 className="text-2xl font-display font-black mb-3">Still Need Backup?</h3>
            <p className="text-slate-700 font-semibold mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our Support HQ is standing by to assist you!
            </p>
            <Link href="/support">
              <button className="btn-game">
                <Zap className="inline w-5 h-5 mr-2" />
                Contact Support HQ
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
