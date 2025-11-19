'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This would normally come from an API or CMS
const blogPosts: Record<string, any> = {
  'dominating-first-hackathon': {
    title: "Dominating Your First Hackathon: A Warrior's Guide",
    category: 'Strategy Guides',
    author: 'Innovation Lab Team',
    date: '2025-01-15',
    readTime: '8 min read',
    image: '🎮',
    content: `
# Introduction

Welcome, brave warrior! You're about to embark on your first raid (hackathon), and we're here to equip you with the knowledge and strategies you need to emerge victorious.

## Preparation is Key

Before you step into the arena, make sure you have:

- **A solid team** - Find guild members with complementary skills
- **The right tools** - Set up your development environment ahead of time
- **A game plan** - Spend the first hour planning your approach
- **Rest and sustenance** - Don't underestimate the importance of sleep and food

## During the Battle

### Time Management
The clock is your biggest adversary. Break down your 24/48 hours into focused sprints:

1. **Planning** (2-3 hours) - Define your MVP and technical architecture
2. **Development** (60-70% of time) - Build your core features
3. **Polish** (15-20% of time) - UI/UX improvements and bug fixes
4. **Presentation** (5-10% of time) - Create your pitch and demo

### Communication
Stay in constant contact with your team. Use tools like Discord, Slack, or even the Innovation Lab's built-in team chat to coordinate effectively.

### Pivot When Necessary
If something isn't working after 2-3 hours, don't be afraid to change direction. Experienced warriors know when to retreat and regroup.

## The Presentation

Your demo can make or break your chances. Remember:

- **Tell a story** - Don't just show features, explain the problem you're solving
- **Demo live if possible** - Recorded demos are safer, but live demos are more impressive
- **Prepare for questions** - Judges will probe your technical decisions
- **Show passion** - Enthusiasm is contagious

## Final Tips

1. **Commit frequently** - Don't lose your work to a crash
2. **Read the judging criteria** - Build what the judges are looking for
3. **Network** - Talk to mentors and other teams
4. **Have fun** - Hackathons are about learning and community

## Conclusion

Your first hackathon won't be perfect, and that's okay. Every legendary warrior started as a novice. The key is to learn, adapt, and keep fighting.

Good luck, champion! May your code compile on the first try and your demo run without bugs.

*Ready to put these strategies to the test? Check out our [active hackathons](/hackathons) and register for your first raid!*
    `,
  },
  'winter-raid-2024-winners': {
    title: 'Winter Raid 2024: Epic Victory Stories',
    category: 'Victory Chronicles',
    author: 'Sarah Chen',
    date: '2025-01-12',
    readTime: '12 min read',
    image: '🏆',
    content: `
# Winter Raid 2024 Champions

The dust has settled, and the winners of Winter Raid 2024 have been crowned! Let's celebrate these legendary guilds and their incredible projects.

## 🥇 First Place: Team Phoenix

**Project:** HealthBridge AI
**Members:** Alex Chen, Maria Rodriguez, James Park, Lisa Wang

HealthBridge AI revolutionized patient care coordination using advanced machine learning to predict patient needs and optimize hospital workflows.

### What Made Them Win

- **Innovation**: Novel approach to healthcare data integration
- **Technical Excellence**: Clean architecture and robust error handling
- **Impact**: Real-world applicability with measurable benefits
- **Presentation**: Compelling demo that resonated with judges

## 🥈 Second Place: Code Crusaders

**Project:** EcoTrack
**Members:** David Kim, Emma Thompson, Ryan Lee

An environmental monitoring system that gamifies sustainable living and rewards eco-friendly behavior with real incentives.

## 🥉 Third Place: The Debuggers

**Project:** LearnFlow
**Members:** Sophie Zhang, Marcus Johnson, Nina Patel

An adaptive learning platform that personalizes education content based on student learning patterns and preferences.

## Lessons from the Winners

All winning teams shared these characteristics:

1. **Clear vision** - They knew what problem they were solving
2. **Strong teamwork** - Roles were clearly defined
3. **Time management** - They focused on MVP first
4. **Professional presentation** - Their demos were polished and compelling

*Inspired by these victories? Join our next raid and write your own success story!*
    `,
  },
  'real-time-collaboration': {
    title: 'New Feature: Real-Time Team Collaboration',
    category: 'Arena Updates',
    author: 'Product Team',
    date: '2025-01-10',
    readTime: '5 min read',
    image: '⚡',
    content: `
# Introducing Real-Time Team Collaboration

We're excited to announce a game-changing update to the Innovation Lab platform: real-time team collaboration tools!

## What's New

### Live Team Chat
Communicate with your guild members instantly without leaving the platform. Features include:

- **Persistent chat rooms** for each team
- **File sharing** for quick asset exchanges
- **Code snippets** with syntax highlighting
- **@mentions** to grab teammate attention

### Shared Task Board
Coordinate your hackathon efforts with our integrated Kanban board:

- Drag-and-drop task management
- Assign tasks to team members
- Track progress in real-time
- Set priorities and deadlines

### Video Calls (Coming Soon)
We're working on integrated video calling so you can have face-to-face strategy sessions right from your dashboard.

## How to Access

Simply navigate to your team page during any active hackathon and click the "Collaboration" tab. All features are available immediately.

## Why We Built This

Based on feedback from over 500 hackathon participants, we learned that:

- 73% of teams struggled with coordination across different tools
- Teams using unified communication scored 23% higher on average
- Real-time collaboration reduced time spent on logistics by 40%

## Get Started

Ready to experience seamless team collaboration? [Join a hackathon](/hackathons) or [create a team](/hackathons) today!

*Have feedback on these features? We'd love to hear from you at feedback@innovationlab.com*
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="game-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-display font-black gradient-text mb-4">
            Post Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            This blog post doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <Button className="btn-game">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="text-sm font-bold">
                {post.category}
              </Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-black gradient-text mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-semibold">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <Card className="game-card">
            <CardContent className="pt-8 pb-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: post.content
                      .split('\n\n')
                      .map((paragraph: string) => {
                        if (paragraph.startsWith('# ')) {
                          return `<h1 class="text-3xl font-display font-black mb-4 mt-8 text-slate-900 dark:text-slate-100">${paragraph.slice(2)}</h1>`;
                        } else if (paragraph.startsWith('## ')) {
                          return `<h2 class="text-2xl font-display font-bold mb-3 mt-6 text-slate-900 dark:text-slate-100">${paragraph.slice(3)}</h2>`;
                        } else if (paragraph.startsWith('### ')) {
                          return `<h3 class="text-xl font-bold mb-2 mt-4 text-slate-900 dark:text-slate-100">${paragraph.slice(4)}</h3>`;
                        } else if (paragraph.startsWith('- ')) {
                          return `<li class="ml-6 mb-2">${paragraph.slice(2)}</li>`;
                        } else if (paragraph.match(/^\d+\. /)) {
                          return `<li class="ml-6 mb-2">${paragraph.replace(/^\d+\. /, '')}</li>`;
                        } else if (paragraph.startsWith('**')) {
                          return `<p class="mb-4 font-semibold">${paragraph.replace(/\*\*/g, '')}</p>`;
                        } else if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                          return `<p class="mb-4 italic text-slate-600 dark:text-slate-400">${paragraph.slice(1, -1)}</p>`;
                        }
                        return `<p class="mb-4">${paragraph}</p>`;
                      })
                      .join(''),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share Section */}
          <div className="mt-8 game-card p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Enjoyed this article?
            </h3>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Link href="/blog">
                <Button className="gap-2">
                  Read More Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
