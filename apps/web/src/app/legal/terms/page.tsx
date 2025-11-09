import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, CheckCircle, User, Trophy, XCircle, Copyright, Ban, AlertTriangle, FileEdit, Mail } from 'lucide-react';

export const metadata = {
  title: 'Arena Rules',
  description: 'Terms of Service for the Innovation Lab arena.',
};

export default function TermsPage() {
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
            <FileText className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Arena Rules
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            Terms of Service for all warriors in the arena
          </p>
          <p className="text-white/90 font-semibold mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Acceptance */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-primary animate-wiggle" />
              1. Acceptance of Arena Rules
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                By entering Innovation Lab arena, you agree to be bound by these Arena Rules and all applicable
                battle regulations. If you do not agree with any of these terms, you are prohibited from entering the arena.
              </p>
            </div>
          </div>

          {/* Use License */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Trophy className="w-7 h-7 text-primary animate-wiggle" />
              2. Arena Access License
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>Permission is granted to:</p>
              <ul className="space-y-2">
                <li>Create a player profile and enter raids and boss challenges</li>
                <li>Submit quests and solutions</li>
                <li>Interact with other warriors and guilds through the arena</li>
                <li>View and download publicly available loot for personal use</li>
              </ul>
              <p>This license shall automatically terminate if you violate any of these arena rules.</p>
            </div>
          </div>

          {/* User Accounts */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <User className="w-7 h-7 text-primary animate-wiggle" />
              3. Player Accounts
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>You are responsible for:</p>
              <ul className="space-y-2">
                <li>Maintaining the confidentiality of your player credentials</li>
                <li>All battle activities that occur under your account</li>
                <li>Notifying Support HQ immediately of any unauthorized access to your account</li>
                <li>Ensuring your player information is accurate and up-to-date</li>
              </ul>
            </div>
          </div>

          {/* User Content */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <FileEdit className="w-7 h-7 text-primary animate-wiggle" />
              4. Quest Content and Submissions
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>By submitting quest content to Innovation Lab, you:</p>
              <ul className="space-y-2">
                <li>Retain ownership of your quest content</li>
                <li>Grant us a license to display, reproduce, and distribute your content in the arena</li>
                <li>Represent that you have the right to submit the quest content</li>
                <li>Agree that your quest submissions may be publicly visible</li>
              </ul>
              <p>
                You are responsible for the content you submit and must ensure it does not violate any laws or third-party rights.
              </p>
            </div>
          </div>

          {/* Prohibited Conduct */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <XCircle className="w-7 h-7 text-primary animate-wiggle" />
              5. Banned Tactics
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>You agree not to:</p>
              <ul className="space-y-2">
                <li>Use the arena for any unlawful purpose</li>
                <li>Harass, abuse, or harm other warriors</li>
                <li>Submit false or misleading battle information</li>
                <li>Attempt to gain unauthorized access to the arena or other players' accounts</li>
                <li>Interfere with the proper functioning of the arena</li>
                <li>Engage in any form of cheating or unfair tactics in raids or boss challenges</li>
                <li>Use automated bots to access or interact with the arena without permission</li>
              </ul>
            </div>
          </div>

          {/* Intellectual Property */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Copyright className="w-7 h-7 text-primary animate-wiggle" />
              6. Intellectual Property
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                The arena, including its design, features, and content (excluding quest submissions), is owned by
                Innovation Lab and protected by intellectual property laws. You may not reproduce, distribute, or create
                derivative works without our express permission.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Ban className="w-7 h-7 text-primary animate-wiggle" />
              7. Account Suspension
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                We reserve the right to terminate or suspend your player account and arena access at any time,
                without notice, for conduct that violates these Arena Rules or is harmful to other warriors
                or the arena.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-primary animate-wiggle" />
              8. Arena Disclaimer
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                The arena is provided "as is" without warranties of any kind. We do not guarantee that the arena
                will be error-free, secure, or available at all times. Use of the arena is at your own risk.
              </p>
            </div>
          </div>

          {/* Liability */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-primary animate-wiggle" />
              9. Limitation of Liability
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                In no event shall Innovation Lab be liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your participation in the arena.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary animate-wiggle" />
              10. Changes to Arena Rules
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                We may revise these Arena Rules at any time. By continuing to battle in the arena after changes are made,
                you agree to be bound by the revised rules.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Mail className="w-7 h-7 text-primary animate-wiggle" />
              11. Contact Information
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 font-semibold">
              <p>
                Questions about the Arena Rules should be sent to Support HQ:
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:legal@innovationlab.com" className="text-primary font-bold hover:underline">legal@innovationlab.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
