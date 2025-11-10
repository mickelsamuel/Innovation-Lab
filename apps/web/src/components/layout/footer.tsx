import Link from 'next/link';

const footerNavigation = {
  platform: [
    { name: 'Hackathons', href: '/hackathons' },
    { name: 'Challenges', href: '/challenges' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'About', href: '/about' },
  ],
  resources: [
    { name: 'Support Center', href: '/support' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Solutions', href: '/challenges/my-solutions' },
  ],
  company: [
    { name: 'National Bank of Canada', href: 'https://nbc.ca' },
    { name: 'Vaultix', href: '#' },
    { name: 'Internships', href: '/internships' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Code of Conduct', href: '/legal/code-of-conduct' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IL</span>
              </div>
              <div>
                <span className="text-lg font-display font-bold text-slate-900">
                  Innovation Lab
                </span>
                <span className="block text-xs text-slate-500">NBC + Vaultix</span>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Empowering innovators to build the future of fintech. Join hackathons, solve
              challenges, and compete for amazing prizes.
            </p>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900">Platform</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.platform.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.resources.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-slate-900">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.company.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-slate-900">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.legal.map(item => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-slate-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500 text-center">
            &copy; {new Date().getFullYear()} National Bank of Canada + Vaultix. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
