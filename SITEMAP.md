# Innovation Lab - Complete Sitemap & QA Checklist

## 🏠 Public Pages
- `/` - Home/Landing Page
- `/about` - About Page
- `/blog` - Blog Page

## 🔐 Authentication Pages
- `/auth/login` - Login Page
- `/auth/register` - Register/Signup Page
- `/auth/forgot-password` - Forgot Password Page
- `/(auth)/login` - Alternative Login Route
- `/(auth)/register` - Alternative Register Route

## 👤 User Dashboard & Profile
- `/dashboard` - User Dashboard (main hub)
- `/profile` - User Profile Page
- `/profile/security` - Profile Security Settings
- `/users/[handle]` - Public User Profile (dynamic)
- `/activity` - User Activity Page
- `/notifications` - Notifications Page
- `/invitations` - Team Invitations Page

## 🏆 Gamification
- `/leaderboard` - Global Leaderboard
- `/badges` - Trophy Vault (Badges Gallery)

## 🎮 Hackathons (Raids)
- `/hackathons` - Hackathons List
- `/hackathons/[slug]` - Individual Hackathon Details (dynamic)
- `/hackathons/[slug]/leaderboard` - Hackathon Leaderboard (dynamic)
- `/hackathons/[slug]/mentors` - Hackathon Mentors (dynamic)
- `/hackathons/[slug]/submissions` - Hackathon Submissions List (dynamic)
- `/hackathons/[slug]/submit` - Submit Project to Hackathon (dynamic)
- `/hackathons/[slug]/teams` - Teams List (dynamic)
- `/hackathons/[slug]/teams/create` - Create Team (dynamic)

## 💪 Challenges (Boss Fights)
- `/challenges` - Challenges List
- `/challenges/[slug]` - Individual Challenge Details (dynamic)
- `/challenges/my-solutions` - My Challenge Solutions
- `/challenges/submissions/[id]` - View Challenge Submission (dynamic)

## 👥 Teams
- `/teams/[id]` - Team Details Page (dynamic)

## 📋 Submissions
- `/submissions/[id]` - Submission Details Page (dynamic)

## ⚖️ Judge Portal
- `/judge` - Judge Dashboard
- `/judge/score/[submissionId]` - Score Submission (dynamic)

## 👨‍🏫 Mentor Portal
- `/mentors/dashboard` - Mentor Dashboard

## 🛡️ Admin Portal
### Main
- `/admin` - Admin Dashboard

### Hackathon Management
- `/admin/hackathons` - Manage Hackathons List
- `/admin/hackathons/create` - Create New Hackathon
- `/admin/hackathons/[id]/edit` - Edit Hackathon (dynamic)
- `/admin/hackathons/[id]/manage` - Manage Hackathon (dynamic)
- `/admin/hackathons/[id]/analytics` - Hackathon Analytics (dynamic)
- `/admin/hackathons/[id]/judges` - Manage Judges (dynamic)
- `/admin/hackathons/[id]/mentors` - Manage Mentors (dynamic)
- `/admin/hackathons/[id]/winners` - Manage Winners (dynamic)

### Challenge Management
- `/admin/challenges` - Manage Challenges List
- `/admin/challenges/create` - Create New Challenge
- `/admin/challenges/[slug]/edit` - Edit Challenge (dynamic)
- `/admin/challenges/[slug]/analytics` - Challenge Analytics (dynamic)
- `/admin/challenges/submissions/[id]/review` - Review Submission (dynamic)

### Other Admin
- `/admin/gamification` - Gamification Management
- `/admin/analytics` - Platform Analytics

## 📚 Information & Legal Pages
- `/support` - Support HQ
- `/faq` - FAQ/Battle Manual
- `/internships` - Student Internships
- `/legal/privacy` - Privacy Shield (Privacy Policy)
- `/legal/terms` - Arena Rules (Terms of Service)
- `/legal/code-of-conduct` - Code of Honor (Code of Conduct)
- `/legal/cookies` - Cookie Vault (Cookie Policy)

---

## 🎨 UI Components & Modals

### Layout Components
- **Header** (`components/layout/header.tsx`)
  - User dropdown menu
  - Mobile navigation menu
  - Notification bell
  - Vault Keys display

- **Footer** (`components/layout/footer.tsx`)

### Modals & Dialogs
- **InviteModal** (`components/invitations/InviteModal.tsx`)
  - Team invitation modal

- **Dialog Component** (`components/ui/dialog.tsx`)
  - Base dialog/modal component (used throughout app)

### Forms
- **ChallengeForm** (`components/challenges/ChallengeForm.tsx`)
  - Create/edit challenge form

- **SubmissionReviewForm** (`components/challenges/SubmissionReviewForm.tsx`)
  - Review challenge submissions

### UI Elements (shadcn/ui components)
Located in `components/ui/`:
- `button.tsx` - Buttons
- `card.tsx` - Cards
- `input.tsx` - Input fields
- `textarea.tsx` - Text areas
- `select.tsx` - Dropdowns/Select
- `dropdown-menu.tsx` - Dropdown menus
- `dialog.tsx` - Modals/Dialogs
- `tabs.tsx` - Tab navigation
- `badge.tsx` - Badges/Pills
- `avatar.tsx` - User avatars
- `toast.tsx` - Toast notifications
- `progress.tsx` - Progress bars
- `slider.tsx` - Sliders
- `switch.tsx` - Toggle switches
- `scroll-area.tsx` - Scroll containers

---

## 📝 QA Testing Checklist

### Pages to Test (by priority)

#### ✅ Already Fixed for Dark Mode:
- [x] Home page
- [x] Dashboard
- [x] Leaderboard
- [x] Badges page
- [x] Support page
- [x] FAQ page
- [x] Internships page
- [x] Privacy policy
- [x] Terms of service
- [x] Code of conduct
- [x] Cookies policy
- [x] Forgot password
- [x] Header component (navigation, dropdowns)

#### 🔲 High Priority - User-Facing Pages:
- [ ] Login page
- [ ] Register page
- [ ] Profile page
- [ ] Profile security page
- [ ] User profile (public view)
- [ ] Hackathons list page
- [ ] Individual hackathon details
- [ ] Challenges list page
- [ ] Individual challenge details
- [ ] Activity page
- [ ] Notifications page
- [ ] Invitations page
- [ ] About page
- [ ] Blog page

#### 🔲 Medium Priority - Detailed Pages:
- [ ] Hackathon leaderboard
- [ ] Hackathon mentors
- [ ] Hackathon submissions
- [ ] Submit to hackathon
- [ ] Teams list
- [ ] Create team
- [ ] Team details
- [ ] My challenge solutions
- [ ] Challenge submission view
- [ ] Submission details

#### 🔲 Admin/Judge/Mentor Pages:
- [ ] Admin dashboard
- [ ] Admin hackathons management
- [ ] Admin create hackathon
- [ ] Admin edit hackathon
- [ ] Admin analytics
- [ ] Admin challenges management
- [ ] Admin gamification
- [ ] Judge dashboard
- [ ] Judge scoring page
- [ ] Mentor dashboard

### Components to Test:
- [x] Header dropdown menu
- [x] Header mobile menu
- [x] Footer
- [ ] InviteModal
- [ ] All form components
- [ ] All UI components (buttons, cards, inputs, etc.)
- [ ] Toast notifications
- [ ] Dialog modals

### Specific UI Elements to Check:
1. **Text visibility** - All text should use `dark:text-slate-100` or `dark:text-slate-300`
2. **Headings** - Should be bright (`dark:text-slate-100`)
3. **Body text** - Should be readable (`dark:text-slate-300`)
4. **Buttons** - Hover states working in dark mode
5. **Cards** - Background and borders visible
6. **Forms** - Input fields, labels, placeholders visible
7. **Icons** - Proper color contrast
8. **Links** - Visible and distinct
9. **Error messages** - Clear and readable
10. **Success messages** - Clear and readable

---

## 🎯 Testing Route Map

### Direct URLs for Testing:
```
Public:
http://localhost:3000/
http://localhost:3000/about
http://localhost:3000/blog
http://localhost:3000/support
http://localhost:3000/faq
http://localhost:3000/internships

Auth:
http://localhost:3000/auth/login
http://localhost:3000/auth/register
http://localhost:3000/auth/forgot-password

User (requires login):
http://localhost:3000/dashboard
http://localhost:3000/profile
http://localhost:3000/profile/security
http://localhost:3000/activity
http://localhost:3000/notifications
http://localhost:3000/invitations

Lists:
http://localhost:3000/hackathons
http://localhost:3000/challenges
http://localhost:3000/leaderboard
http://localhost:3000/badges

Legal:
http://localhost:3000/legal/privacy
http://localhost:3000/legal/terms
http://localhost:3000/legal/code-of-conduct
http://localhost:3000/legal/cookies

Admin (requires admin role):
http://localhost:3000/admin
http://localhost:3000/admin/hackathons
http://localhost:3000/admin/challenges
http://localhost:3000/admin/analytics
http://localhost:3000/admin/gamification

Judge (requires judge role):
http://localhost:3000/judge

Mentor (requires mentor role):
http://localhost:3000/mentors/dashboard
```

### Dynamic Routes (need actual IDs/slugs):
- Replace `[slug]` with actual hackathon slug
- Replace `[id]` with actual ID
- Replace `[handle]` with actual user handle

Example:
- `/hackathons/winter-2024`
- `/challenges/build-react-app`
- `/users/johndoe`
- `/teams/123`
- `/submissions/456`
