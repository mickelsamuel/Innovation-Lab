import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Sparkles,
  Lock,
  Eye,
  Users,
  ShieldCheck,
  Cookie,
  FileText,
  Mail,
} from 'lucide-react';

export const metadata = {
  title: 'Privacy Shield',
  description: 'How we protect your data in the arena.',
};

export default function PrivacyPage() {
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
            <Shield className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Privacy Shield
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            How we protect your data in the arena
          </p>
          <p className="text-white/90 font-semibold mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Information We Collect */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Eye className="w-7 h-7 text-primary animate-wiggle" />
              1. Information We Collect
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>We collect information you provide when you:</p>
              <ul className="space-y-2">
                <li>Create your player profile</li>
                <li>Enter raids or challenge bosses</li>
                <li>Submit quests or solutions</li>
                <li>Communicate with other players or guilds</li>
              </ul>
              <p>
                This may include your name, email address, username, profile information, and
                submitted content.
              </p>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-7 h-7 text-primary animate-wiggle" />
              2. How We Use Your Information
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>We use the information we collect to:</p>
              <ul className="space-y-2">
                <li>Provide, maintain, and improve the arena experience</li>
                <li>Process your raid registrations and quest submissions</li>
                <li>Send you battle alerts and support messages</li>
                <li>Communicate about raids, boss challenges, and arena updates</li>
                <li>Calculate your XP, levels, and trophies</li>
                <li>Display your player profile and achievements to other warriors</li>
              </ul>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Users className="w-7 h-7 text-primary animate-wiggle" />
              3. Information Sharing and Disclosure
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>We may share your information in the following circumstances:</p>
              <ul className="space-y-2">
                <li>
                  <strong>With Other Players:</strong> Your profile, quest submissions, and battle
                  activity are visible to other arena warriors
                </li>
                <li>
                  <strong>With Raid Organizers:</strong> When you enter raids, organizers can see
                  your quest submissions
                </li>
                <li>
                  <strong>With Judges:</strong> Your quests are shared with assigned judges for
                  scoring
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law or to protect our rights
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Lock className="w-7 h-7 text-primary animate-wiggle" />
              4. Data Protection
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                We take legendary measures to protect your information from unauthorized access,
                alteration, disclosure, or destruction. However, no internet transmission is
                completely secure, and we cannot guarantee absolute security in the arena.
              </p>
            </div>
          </div>

          {/* Rights and Choices */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-7 h-7 text-primary animate-wiggle" />
              5. Your Rights and Choices
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>You have the right to:</p>
              <ul className="space-y-2">
                <li>Access and update your player profile at any time</li>
                <li>Delete your account by contacting Support HQ</li>
                <li>Opt out of promotional battle notifications</li>
                <li>Request a copy of your data</li>
              </ul>
            </div>
          </div>

          {/* Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Cookie className="w-7 h-7 text-primary animate-wiggle" />
              6. Cookies and Tracking
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                We use cookies and similar technologies to provide, secure, and improve our arena
                services. You can control cookies through your browser settings. See our{' '}
                <Link href="/legal/cookies" className="text-primary font-bold hover:underline">
                  Cookie Vault
                </Link>{' '}
                for more details.
              </p>
            </div>
          </div>

          {/* Changes */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <FileText className="w-7 h-7 text-primary animate-wiggle" />
              7. Changes to This Policy
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                We may update this Privacy Shield from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Mail className="w-7 h-7 text-primary animate-wiggle" />
              8. Contact Support HQ
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>If you have questions about this Privacy Shield, please contact Support HQ at:</p>
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:privacy@innovationlab.com"
                  className="text-primary font-bold hover:underline"
                >
                  privacy@innovationlab.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
