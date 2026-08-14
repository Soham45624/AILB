# AI Tool Discovery & Community Platform

A production-ready, full-stack AI Tool Discovery Platform built with **Next.js 16 (App Router + Turbopack)**, **TypeScript**, **Tailwind CSS**, and **Supabase (Auth, Postgres Database, Row-Level Security, and Storage)**.

---

## Key Features

1. **Public AI Tool Discovery**:
   - Real-time full-text search across titles, descriptions, and `#tags`.
   - Multi-facet filters: Categories, Pricing Models (Free, Freemium, Free Trial, Paid, Enterprise), and Platforms.
   - Dynamic sorting: Popularity (Views/Clicks), Top Rated, Most Reviewed, and Newest.
   - Deep shareable URL state synchronization.

2. **Tool Detail & Evaluation**:
   - Comprehensive tool overview, pricing badges, and feature lists.
   - Distinct **Contributor Perspective / Insights** card separate from community ratings.
   - Interactive 5-star review submission system.
   - Save / Bookmark tools to personal dashboard library.
   - Outbound click and impression tracking.
   - Incident & flag reporting system.

3. **Community Submission Pipeline (`/submit`)**:
   - Authenticated tool submissions with URL normalization and canonical domain extraction.
   - Real-time duplicate collision detection with direct link to existing tools.
   - Smart keyword-based `#tag` suggestions.
   - Rate limiting (max 10 submissions/hour per account) and abuse prevention.
   - Dedicated user tracking dashboard at `/dashboard/submissions`.

4. **Role-Based Admin Control Center (`/admin`)**:
   - Server-side route protection supporting roles `USER`, `EDITOR`, and `ADMIN`.
   - Real-time platform KPI telemetry (Tools, Users, Views, Outbound Clicks, Reviews, Open Reports).
   - Submission Moderation Queue (Approve & Publish, Request Changes with notes, Reject, Edit inline).
   - Tool Management (Edit metadata, Delete, Toggle Featured / Trending).
   - Review Moderation (Soft-delete with reason, Restore).
   - User Management (Audit, Change role, Suspend / Reinstate accounts).
   - Incident Reports Queue (Tool reports, Review reports, User reports).

5. **SEO & Performance Optimization**:
   - Dynamic XML Sitemap (`/sitemap.xml`) generated from live database tools.
   - Custom `robots.txt` (`/robots.txt`).
   - Schema.org JSON-LD structured data (`WebSite` and `SoftwareApplication`).
   - Optimized image handling with Next.js remote patterns.
   - Postgres B-Tree performance indexes on lookup columns.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Public Key | `eyJhbGciOi...` |
| `NEXT_PUBLIC_APP_URL` | Canonical Base URL | `http://localhost:3000` or `https://your-domain.vercel.app` |

> [!CAUTION]
> Never commit `.env` or `.env.local` to Git. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.

---

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Validate Production Build**:
   ```bash
   npm run build
   ```

---

## Database Migrations & Schema

The platform relies on the following Postgres schema in Supabase:

- `public.profiles`: User metadata, display names, avatars, bio, `role` (`user` | `editor` | `admin`), and `is_suspended`.
- `public.tools`: Directory catalog with slug, category links, tags, `avg_rating`, `review_count`, `view_count`, `click_count`, `featured`, `trending`, and `contributor_feedback`.
- `public.categories`: 18 curated AI categories with icons and slugs.
- `public.tags` & `public.tool_tags`: Tag taxonomy for discovery.
- `public.submissions`: Moderation queue with statuses (`pending`, `changes_requested`, `approved`, `rejected`), moderator feedback, and submitted metadata.
- `public.reviews`: Community ratings (1-5 stars), text evaluations, and soft-deletion flags.
- `public.favorites`: User saved tool bookmarks.
- `public.reports`: Community incident flags on tools, reviews, and users.
- `public.tool_clicks` & `public.tool_views`: Engagement telemetry.

---

## Deploying to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
   - Select the `AILB` repository.

3. **Configure Environment Variables**:
   - In Vercel Project Settings > **Environment Variables**, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL e.g. `https://ailb.vercel.app`)

4. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `npm run build` and provision edge CDN routes.

5. **Update Supabase Auth URL Configuration**:
   - In your Supabase Dashboard > **Authentication > URL Configuration**:
     - Set **Site URL** to `https://your-app.vercel.app`.
     - Add `https://your-app.vercel.app/**` to **Redirect URLs**.
