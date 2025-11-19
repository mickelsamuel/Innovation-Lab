'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  ArrowRight,
  Trophy,
  Megaphone,
  Swords,
  Target,
  Zap,
  Calendar,
  Clock,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Sample blog posts
  const blogPosts = [
    {
      id: '1',
      title: 'Dominating Your First Hackathon: A Warrior\'s Guide',
      excerpt: 'Learn proven strategies from legendary developers who conquered their first raids and emerged victorious.',
      category: 'Strategy Guides',
      author: 'Innovation Lab Team',
      date: '2025-01-15',
      readTime: '8 min read',
      image: '🎮',
      slug: 'dominating-first-hackathon',
    },
    {
      id: '2',
      title: 'Winter Raid 2024: Epic Victory Stories',
      excerpt: 'Meet the legendary guilds who dominated Winter Raid 2024 and discover the secrets behind their award-winning projects.',
      category: 'Victory Chronicles',
      author: 'Sarah Chen',
      date: '2025-01-12',
      readTime: '12 min read',
      image: '🏆',
      slug: 'winter-raid-2024-winners',
    },
    {
      id: '3',
      title: 'New Feature: Real-Time Team Collaboration',
      excerpt: 'Introducing real-time collaboration tools for guilds! Now coordinate with your team like never before.',
      category: 'Arena Updates',
      author: 'Product Team',
      date: '2025-01-10',
      readTime: '5 min read',
      image: '⚡',
      slug: 'real-time-collaboration',
    },
    {
      id: '4',
      title: 'Mastering React Hooks in Boss Challenges',
      excerpt: 'A deep dive into advanced React patterns that helped warriors defeat the toughest coding bosses.',
      category: 'Strategy Guides',
      author: 'Tech Warriors Guild',
      date: '2025-01-08',
      readTime: '15 min read',
      image: '⚔️',
      slug: 'mastering-react-hooks',
    },
    {
      id: '5',
      title: 'From Novice to Legend: Alex\'s Journey',
      excerpt: 'How one developer went from their first raid to winning three consecutive hackathons in just 6 months.',
      category: 'Victory Chronicles',
      author: 'Community Team',
      date: '2025-01-05',
      readTime: '10 min read',
      image: '👑',
      slug: 'novice-to-legend-alex',
    },
    {
      id: '6',
      title: 'Q1 2025 Arena Roadmap Revealed',
      excerpt: 'Get exclusive insights into upcoming features, new raid types, and platform improvements coming this quarter.',
      category: 'Arena Updates',
      author: 'Leadership Team',
      date: '2025-01-03',
      readTime: '6 min read',
      image: '🗺️',
      slug: 'q1-2025-roadmap',
    },
  ];

  const categories = ['ALL', 'Strategy Guides', 'Victory Chronicles', 'Arena Updates'];

  const filteredPosts =
    selectedCategory === 'ALL'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strategy Guides':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'Victory Chronicles':
        return 'bg-accent/20 dark:bg-accent/10 text-accent-foreground border-accent/40';
      case 'Arena Updates':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600';
    }
  };

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-20 overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/">
            <button className="btn-game-secondary text-sm px-4 py-2 mb-6 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
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
        <div className="max-w-6xl mx-auto">
          {/* Categories Filter */}
          <div className="mb-8">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-3 uppercase">
              Filter by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="game-card p-0 overflow-hidden h-full flex flex-col hover:scale-105 transition-transform duration-200">
                  {/* Image/Icon */}
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-12 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
                    <span className="text-6xl">{post.image}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Category Badge */}
                    <Badge
                      className={`mb-3 w-fit text-xs font-bold border ${getCategoryColor(post.category)}`}
                    >
                      {post.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="text-xl font-display font-black mb-3 text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-4 flex-1 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-primary dark:text-accent font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="game-card p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4 animate-float" />
              <h3 className="text-2xl font-display font-black text-slate-900 dark:text-slate-100 mb-2">
                No Chronicles Found
              </h3>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">
                Try selecting a different category or check back later for new battle stories!
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 game-card p-8 text-center">
            <Zap className="w-12 h-12 text-primary mx-auto mb-4 animate-sparkle" />
            <h2 className="text-3xl font-display font-black mb-4 text-slate-900 dark:text-slate-100">
              Ready to Write Your Own Victory Story?
            </h2>
            <p className="text-slate-700 dark:text-slate-300 font-semibold mb-6 max-w-2xl mx-auto leading-relaxed">
              Join active raids, conquer epic bosses, and become a legendary warrior in the Innovation Lab arena!
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
        </div>
      </div>
    </div>
  );
}
