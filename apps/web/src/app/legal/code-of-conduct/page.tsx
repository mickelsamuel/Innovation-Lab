import Link from 'next/link';
import { ArrowLeft, Heart, Users, Shield, Sparkles, CheckCircle, XCircle, Ban, FileText } from 'lucide-react';

export const metadata = {
  title: 'Code of Honor',
  description: 'Community standards for respectful competition in the arena.',
};

export default function CodeOfConductPage() {
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
            <Heart className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Code of Honor
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Building a respectful and legendary community of warriors
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Our Pledge */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Heart className="w-7 h-7 text-primary animate-wiggle" />
              Our Warrior's Pledge
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                In the interest of fostering an open and welcoming arena, we pledge to make participation
                in Innovation Lab a harassment-free experience for every warrior, regardless of age, body size, disability,
                ethnicity, gender identity and expression, level of experience, nationality, personal appearance,
                race, religion, or sexual identity and orientation.
              </p>
            </div>
          </div>

          {/* Our Standards */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Users className="w-7 h-7 text-primary animate-wiggle" />
              Honorable Conduct
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-900">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Examples of legendary warrior behavior:
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 font-semibold">
                  <li>Using welcoming and inclusive language in all guild communications</li>
                  <li>Being respectful of different battle strategies and experiences</li>
                  <li>Gracefully accepting constructive feedback on quests</li>
                  <li>Focusing on what is best for the arena community</li>
                  <li>Showing empathy and support towards fellow warriors</li>
                  <li>Giving credit where credit is due in team victories</li>
                  <li>Being collaborative and supportive in guild battles</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-900">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Examples of dishonorable conduct:
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 font-semibold">
                  <li>The use of inappropriate language or imagery and unwelcome advances</li>
                  <li>Trolling, insulting comments, and personal attacks on other warriors</li>
                  <li>Public or private harassment of fellow players</li>
                  <li>Publishing others' private information without explicit permission</li>
                  <li>Cheating or plagiarism in raids or boss challenges</li>
                  <li>Spamming or excessive self-promotion in the arena</li>
                  <li>Other conduct which could reasonably be considered inappropriate in a competitive setting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Our Responsibilities */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary animate-wiggle" />
              Arena Guardian Responsibilities
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                Arena administrators are responsible for clarifying the standards of honorable conduct and are expected
                to take appropriate and fair corrective action in response to any instances of dishonorable behavior.
              </p>
              <p>
                Administrators have the right and responsibility to remove, edit, or reject quest submissions, comments, and other
                contributions that are not aligned with this Code of Honor, or to ban temporarily or permanently any warrior
                for behaviors that they deem inappropriate, threatening, offensive, or harmful.
              </p>
            </div>
          </div>

          {/* Scope */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary animate-wiggle" />
              Arena Scope
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                This Code of Honor applies to all Innovation Lab arena spaces, including raids, boss challenges, guild forums,
                and any other warrior interactions. It also applies when a warrior is representing Innovation Lab
                in public spaces.
              </p>
            </div>
          </div>

          {/* Enforcement */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Ban className="w-7 h-7 text-primary animate-wiggle" />
              Disciplinary Actions
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                Instances of dishonorable, harassing, or otherwise unacceptable behavior may be reported by contacting
                the moderation team at <a href="mailto:conduct@innovationlab.com" className="text-primary font-bold hover:underline">conduct@innovationlab.com</a>.
                All complaints will be reviewed and investigated promptly and fairly.
              </p>
              <p>
                All moderators are obligated to respect the privacy and security of the reporter of any incident.
              </p>
            </div>
          </div>

          {/* Enforcement Guidelines */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary animate-wiggle" />
              Disciplinary Guidelines
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">1. Warning</h3>
                <p className="text-slate-700 font-semibold">
                  For minor violations, a private warning may be issued explaining the nature of the dishonor and why
                  the behavior was inappropriate in the arena.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">2. Temporary Suspension</h3>
                <p className="text-slate-700 font-semibold">
                  For more serious violations or repeated minor violations, a temporary suspension from the arena or specific
                  battle features may be imposed.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">3. Permanent Ban</h3>
                <p className="text-slate-700 font-semibold">
                  For severe violations or repeated serious violations, a permanent ban from the arena may be enforced.
                </p>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary animate-wiggle" />
              Attribution
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                This Code of Honor is adapted from the{' '}
                <a href="https://www.contributor-covenant.org/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
                  Contributor Covenant
                </a>, version 2.0.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
