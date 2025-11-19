import Link from 'next/link';
import {
  ArrowLeft,
  Cookie,
  Sparkles,
  Shield,
  Settings,
  Eye,
  Globe,
  FileText,
  Mail,
} from 'lucide-react';

export const metadata = {
  title: 'Cookie Vault',
  description: 'How we use cookies to enhance your arena experience.',
};

export default function CookiesPage() {
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
            <Cookie className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Cookie Vault
            </h1>
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Sparkles className="inline w-6 h-6 mr-2 animate-sparkle" />
            How we use cookies to enhance your arena experience
          </p>
          <p className="text-white/90 font-semibold mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* What Are Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Cookie className="w-7 h-7 text-primary animate-wiggle" />
              What Are Cookie Items?
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                Cookies are small data files that are stored on your device when you enter the
                arena. They are widely used to make the arena work more efficiently and provide
                information to arena administrators.
              </p>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Settings className="w-7 h-7 text-primary animate-wiggle" />
              How We Use Cookies in the Arena
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>Innovation Lab uses cookies to:</p>
              <ul className="space-y-2">
                <li>Keep you signed in to your player account</li>
                <li>Remember your battle preferences and arena settings</li>
                <li>Understand how you navigate through raids and challenges</li>
                <li>Improve arena performance and player experience</li>
                <li>Provide security features to protect your account</li>
              </ul>
            </div>
          </div>

          {/* Types of Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Shield className="w-7 h-7 text-primary animate-wiggle" />
              Types of Cookie Items
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">1. Essential Cookies</h3>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  These cookies are necessary for the arena to function. They enable core
                  functionality such as security, player authentication, and maintaining your battle
                  session. Without these cookies, the arena would not work properly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">2. Functional Cookies</h3>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  These cookies enable enhanced functionality and personalization, such as
                  remembering your battle preferences, language settings, and region.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">3. Performance Cookies</h3>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  These cookies help us understand how warriors interact with the arena by
                  collecting and reporting information anonymously. This helps us improve how the
                  arena performs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">4. Analytics Cookies</h3>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">
                  We use analytics cookies to gather statistics about arena usage, including which
                  raids are most popular and if players encounter errors during battle.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Globe className="w-7 h-7 text-primary animate-wiggle" />
              Third-Party Cookie Items
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                In addition to our own cookies, we may use various third-party cookies to report
                arena usage statistics and deliver content based on your battle interests.
              </p>
              <p>These third parties may include:</p>
              <ul className="space-y-2">
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Authentication services for player login</li>
                <li>Content delivery networks for arena assets</li>
              </ul>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Eye className="w-7 h-7 text-primary animate-wiggle" />
              Managing Your Cookies
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that
                are already stored on your device and you can set most browsers to prevent them from
                being placed.
              </p>
              <p>
                However, if you do this, you may have to manually adjust some preferences every time
                you enter the arena, and some battle services and functionalities may not work
                properly.
              </p>
              <h3 className="font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">Browser Settings:</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Edge
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Updates */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <FileText className="w-7 h-7 text-primary animate-wiggle" />
              Updates to This Policy
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                We may update this Cookie Vault policy from time to time to reflect changes in our
                arena practices or for other operational, legal, or regulatory reasons. Please
                review this policy periodically for any updates.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="game-card p-8">
            <h2 className="text-2xl font-display font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <Mail className="w-7 h-7 text-primary animate-wiggle" />
              Contact Support HQ
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 dark:text-slate-300 font-semibold">
              <p>
                If you have questions about our use of cookies in the arena, please contact Support
                HQ at:
              </p>
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
