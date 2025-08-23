# Project Reach — PRD (Cursor‑Ready)

**Stack:** React Native (Expo) · FastAPI (Python) · Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)

**Mission:** Bridge income‑induced gaps in early childhood education by equipping Hong Kong parents with guidance, community, and gamified motivation to support learning at home.

**Primary KPIs (North Stars):**
- Weekly activity completion rate per child.
- 7‑day and 30‑day parent retention.
- Community helpfulness rate (\# questions with an accepted answer / total questions).

**Guardrails:** HK PDPO compliance, privacy‑first defaults (no child faces by default), inclusive design (EN/繁中), and positive‑sum gamification (no shaming).

---

## 0) One‑Shot Prompt for Cursor (drop this into Cursor to scaffold everything)

> **SYSTEM GOAL:** Create a production‑ready mobile app (React Native + Expo) with a FastAPI backend and Supabase (Postgres/Auth/Storage/Realtime). Implement the screens and behaviors from the PRD below, seed the DB, connect Supabase, and generate CI, tests, and Storybook.
>
> **Tech decisions:** RN (Expo), TypeScript, React Navigation, TanStack Query, Zod, i18next, Victory Native charts, Expo Notifications, @supabase/supabase-js. FastAPI (Python 3.11), Pydantic v2, supabase‑py, SQLAlchemy (read‑only), JWT auth via Supabase. Supabase: SQL schema & RLS policies as specified.
>
> **Tasks:**
> 1. **Repo setup**: pnpm workspaces with `apps/mobile` (Expo RN) and `apps/api` (FastAPI), `packages/ui` (shared RN components), `packages/config` (eslint, tsconfig), `packages/types` (shared types).
> 2. **Supabase**: create SQL schema and RLS from Section **10–11**; add seed data (demo class, one parent, one child, example booklets/activities, sample posts, token shop items). Provide `supabase/seed.sql`.
> 3. **API**: Implement endpoints from Section **12** with Pydantic models; protect routes using Supabase JWT; include OpenAPI docs; add unit tests (pytest) for core flows: progress update, token redemption, post create/report.
> 4. **Mobile app**: Implement all screens from Section **5** (Parent) + onboarding (Section **5.9**) and the missing **Teacher** light MVP (Section **5.10**). Hook to Supabase; use React Query for data; implement optimistic updates for likes, comments, token redemptions. Add i18n (EN/繁中). Add push notifications (Expo) wired to backend.
> 5. **Realtime**: Subscribe to community posts/comments via Supabase Realtime channels; update unread chat counts and redemption status in real time.
> 6. **Analytics**: Implement the events from Section **16**, integrate PostHog. Provide dashboard presets.
> 7. **CI/CD**: GitHub Actions for API (lint, test, build, Dockerfile) and Mobile (lint, typecheck, build via EAS — optional placeholder). Add `.env.example` with required vars.
> 8. **Stories & tests**: Storybook in `apps/mobile` with key components; e2e smoke via Detox for onboarding → complete task → earn tokens.
> 9. **Docs**: README with run instructions; add `scripts/dev` to run Supabase local, API, and Expo.
>
> **Acceptance:** All AC in Section **21** pass locally with seeded data.

---

## 1) Product Overview
Parents supported by Project Reach struggle with fragmented, paper‑based guidance. This app centralizes weekly booklets and at‑home activities, motivates kids with stars/badges/tokens, and gives parents a supportive community, forums, chats, and an “expert parents” directory. A simple token shop provides tangible rewards.

## 2) Scope (MVP vs. Stretch)
**MVP**
- Parent mode screens: Home/Dashboard, Learn, Community (Achievements, Forums, Chats, Experts), Games, Analytics, Tokens, Materials.
- Onboarding (language, consent, child profile), Notifications (push + in‑app inbox).
- Teacher light MVP (read‑only class view, chats).
- Gamification: stars, streaks, badges (core), token balance + redemptions.
- Community: posts, comments, likes, report/flag, expert labels.

**Stretch**
- Bedtime story unlockables after streaks, leaderboards, offline cache, richer moderation queue, external SuperAPP OAuth + sync.

## 3) Personas
- **Parent (primary)**: busy caregiver, mobile‑first, varying digital literacy, prefers EN or 繁中.
- **Teacher (secondary)**: oversees class cohorts, posts reminders, answers questions.
- **Admin (internal)**: publishes weekly content, reviews reports, fulfills redemptions.

## 4) Information Architecture & Nav
- **Tabs:** Home · Learn · Community · Games · Analytics · Tokens
- **Community sub‑tabs:** Achievements · Forums · Chats · Experts
- **Mode switch:** Parent / Teacher (header toggle)

## 5) Feature Specifications (Parent)
### 5.1 Home / Dashboard
- **Weekly Goal**: progress bar; text like `3/5 activities completed` and percent.
- **Booklet Progress**: e.g., *Alphabet Time* with `12/26 modules` and `Current Module: 12`, `2 months remaining`.
- **Performance Metrics**: Reading Speed (WPM), Comprehension Accuracy (%), Weekly Engagement Time (h), Skill Progression (%).
- **Certificates**: list with “Alphabet Master” card; tap → certificate detail (shareable image).

**Actions**: tap goal/booklet → Learn detail; tap metric → Analytics; tap certificate → detail.

### 5.2 Learn
- **Homework Calendar**: week chips (Week 1…); shows tasks count; horizontal scroll.
- **Current Work** (by subject): Each task shows due date, task type badges: *In‑App Task* (play icon) and *Pen & Paper Work* (camera to upload proof). Completion checkmark state.
- **Completed Work**: collapsible list with completed tasks.
- **Materials → Past Uploads**: files with type icon (pdf/jpg/mp3), size, View.

**Proof Upload**: open camera/gallery, upload to Supabase Storage; attach to `activity_progress.proof_url`.

### 5.3 Community
**Achievements feed**
- Post type: celebration (text + optional photo/video). Show likes, comments, time.

**Forums**
- Channel list tied to content areas (Alphabet Time, Vocabulary, etc.). Threads show title, snippet, votes/likes, replies.

**Chats**
- 1:1 threads with teachers or parents; sorted by recency; unread badge.

**Experts**
- Directory of parents tagged as “Top Expert” with helpful answers count, expertise chips, online status; tap to open chat.

**Moderation**: report button on posts/comments; auto‑hide thresholds; admin review queue.

### 5.4 Games
- **Weekly Challenge** card (e.g., *Family Reading Marathon*) with difficulty, cohort participation count, days remaining, and progress `4/7 days`.
- **Extra Games** list with duration estimates.
- Mark a day complete once/day; progress contributes to streak/badges and tokens.

### 5.5 Analytics
- Repeat **Performance Metrics** block.
- External **SuperAPP Progress** card with connected status, subject levels, external points, and CTA to open external app.
- **Reading/Writing Performance**: percentile charts with child’s score marked.

### 5.6 Tokens
- **Balance header** with “Earned this week” and cohort rank (percentile).
- **Token Shop**: items with price and Redeem button.
- **History**: line items like “Helpful answer in Reading channel (+15)”, “Weekly engagement bonus (+20)”, “Fun Stickers Pack (−30)”.
- **Redemption flow**: confirm → backend validates balance → create `redemptions` → deduct balance → status updates (requested → approved/fulfilled by staff).

### 5.7 Certificates & Badges
- Award certificates (e.g., Alphabet Master) and badges based on rules in Section **6**; render printable/shareable images.

### 5.8 Notifications
- Push + in‑app inbox: new booklet, streak nudge, weekly challenge reminder, token redemption status, rank change, helpful‑answer badge.

### 5.9 Onboarding
- Language select (EN/繁中) → PDPO consent → profile create → add child profile (nickname, age band K1/K2/K3) → join class (code) → tutorial tips.

### 5.10 Teacher (light MVP)
- Class dashboard (read‑only): list of children with completion % and alerts.
- Class forums & announcements; reply to parent posts.
- Chats (1:1 with parents). No grade edit in MVP.

---

## 6) Gamification Rules (MVP)
- **Stars**: Each activity defines `points` (default 5). Completing a weekly booklet target of 5 activities → +10 bonus tokens.
- **Streaks**: Completing ≥3 activities in a week counts as 1 streak week. 3‑week streak → badge; a missed week resets streak.
- **Badges (examples)**: “3‑Week Streak”, “Booklet Champion (20 activities)”, “Helper (5 helpful answers)”. Stored in `badges` with `criteria_json`.
- **Parent Recognition**: “Engaged Parent of the Week” → top 10% by completion + helpfulness (ties by earliest completion timestamp).
- **Anti‑gaming**: single completion per activity per child; random photo proof sampling; cooldown to prevent spam likes.

## 7) Token Economy
- **Earning** (defaults): complete activity +5, complete weekly goal +10, helpful answer +15, achievement post likes +1 (cap 10/day), weekly engagement bonus +20 if ≥2h.
- **Spending**: redeem shop items; parent sees `requested` → staff updates to `fulfilled`.
- **Rank**: weekly percentile by total earned; stored in `leaderboards`.

## 8) Community Safety & Moderation
- **Defaults**: Blur child faces by default; show school/class chips; allow Anonymous in forums.
- **Controls**: report reasons (privacy, harassment, off‑topic); temp mutes; block user; banned keywords auto‑hold.
- **Admin queue**: `reports` table; SLA 48h; audit log on actions.

## 9) Data Model (ERD summary)
Entities (keys → major relations):
- `profiles(user_id)` ←→ `children(parent_user_id)` ←→ `activity_progress(child_id, activity_id)`.
- Content: `booklets` → `modules` → `activities`.
- Gamification: `badges` ↔ `child_badges`, `streaks`, `certificates` ↔ `child_certificates`.
- Community: `posts` ↔ `comments` ↔ `reactions`; `threads` ↔ `thread_participants` ↔ `messages`.
- Tokens: `token_accounts` ↔ `token_transactions` ↔ `redemptions`; `shop_items`.
- Analytics: `kpi_metrics`, `external_integrations`, `external_metrics`.
- Cohorts: `classes`, `enrollments(child_id,class_id)`.

---

## 10) Supabase Schema (SQL)
```sql
-- ENUMS
create type role as enum ('parent','teacher','admin');
create type task_type as enum ('in_app','pen_paper','game','audio');
create type post_type as enum ('achievement','question');
create type reason_type as enum ('activity_complete','weekly_goal','helpful_answer','post_like','engagement_bonus','purchase','gift');
create type redemption_status as enum ('requested','approved','fulfilled','canceled');

-- PROFILES
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role role not null default 'parent',
  full_name text,
  locale text default 'en',
  school text,
  grade text,
  created_at timestamptz default now()
);

-- CHILDREN & CLASSES
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  school text not null,
  name text not null,
  grade text not null,
  created_at timestamptz default now()
);

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  age_band text,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  child_id uuid references children(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  primary key (child_id, class_id)
);

-- BOOKLETS, MODULES, ACTIVITIES
create table if not exists booklets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  week_start date,
  week_end date,
  locale text default 'en',
  total_modules int,
  subject text
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  booklet_id uuid references booklets(id) on delete cascade,
  idx int not null,
  title text,
  description text
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references modules(id) on delete cascade,
  type task_type not null,
  points int default 5,
  est_minutes int default 10,
  instructions text,
  media jsonb default '[]'::jsonb
);

create table if not exists activity_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  status text check (status in ('not_started','in_progress','completed')) default 'completed',
  proof_url text,
  score numeric,
  notes text,
  completed_at timestamptz default now(),
  unique(child_id, activity_id)
);

-- BADGES & CERTIFICATES
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  criteria_json jsonb not null,
  icon_url text
);
create table if not exists child_badges (
  child_id uuid references children(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (child_id, badge_id)
);
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text
);
create table if not exists child_certificates (
  child_id uuid references children(id) on delete cascade,
  certificate_id uuid references certificates(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (child_id, certificate_id)
);

-- GAMES
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty text,
  est_minutes int
);
create table if not exists game_instances (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  week_start date,
  week_end date,
  class_id uuid references classes(id) on delete cascade,
  status text default 'active'
);
create table if not exists game_progress (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid references game_instances(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  days_done int default 0,
  last_day date,
  is_completed boolean default false,
  unique(instance_id, child_id)
);

-- COMMUNITY
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid references auth.users(id) on delete cascade,
  class_id uuid references classes(id) on delete set null,
  type post_type not null,
  content text,
  media jsonb default '[]'::jsonb,
  anonymous boolean default false,
  created_at timestamptz default now()
);
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text default 'like',
  unique(post_id, user_id)
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  target_type text check (target_type in ('post','comment')),
  target_id uuid not null,
  reporter_id uuid references auth.users(id),
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

-- CHATS
create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('direct','class')) default 'direct',
  class_id uuid references classes(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);
create table if not exists thread_participants (
  thread_id uuid references threads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  last_read_at timestamptz,
  primary key (thread_id, user_id)
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  body text,
  media jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- TOKENS & SHOP
create table if not exists token_accounts (
  child_id uuid primary key references children(id) on delete cascade,
  balance int default 0,
  weekly_earned int default 0,
  rank_percentile numeric
);
create table if not exists token_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references token_accounts(child_id) on delete cascade,
  delta int not null,
  reason reason_type not null,
  ref_table text,
  ref_id uuid,
  actor_id uuid references auth.users(id),
  created_at timestamptz default now()
);
create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price int not null,
  is_active boolean default true,
  inventory_qty int
);
create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references token_accounts(child_id) on delete cascade,
  item_id uuid references shop_items(id) on delete restrict,
  qty int default 1,
  status redemption_status default 'requested',
  requested_at timestamptz default now(),
  fulfilled_at timestamptz,
  notes text
);
create table if not exists leaderboards (
  period_start date,
  period_end date,
  class_id uuid references classes(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
  rank int,
  percentile numeric,
  primary key (period_start, class_id, child_id)
);

-- ANALYTICS
create table if not exists kpi_metrics (
  child_id uuid references children(id) on delete cascade,
  metric text,
  value_num numeric,
  unit text,
  period_start date,
  period_end date,
  source text default 'internal',
  primary key (child_id, metric, period_start)
);
create table if not exists external_integrations (
  id uuid primary key default gen_random_uuid(),
  name text,
  status text,
  last_sync_at timestamptz,
  auth_type text,
  external_user_id text
);
create table if not exists external_metrics (
  child_id uuid references children(id) on delete cascade,
  integration_id uuid references external_integrations(id) on delete cascade,
  metric text,
  value_num numeric,
  recorded_at timestamptz,
  meta jsonb,
  primary key (child_id, integration_id, metric, recorded_at)
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text,
  payload jsonb,
  delivered_at timestamptz,
  read_at timestamptz
);
```

---

## 11) RLS Policies (Supabase)
```sql
-- helper: is_parent_of_child
create or replace function is_parent_of_child(c uuid) returns boolean language sql stable as $$
  select exists(select 1 from children ch where ch.id = c and ch.parent_user_id = auth.uid());
$$;

-- PROFILES
alter table profiles enable row level security;
create policy "own profile" on profiles for select using (user_id = auth.uid());
create policy "update own profile" on profiles for update using (user_id = auth.uid());

-- CHILDREN
alter table children enable row level security;
create policy "parent reads own children" on children for select using (parent_user_id = auth.uid());
create policy "parent writes own children" on children for insert with check (parent_user_id = auth.uid());
create policy "parent updates own children" on children for update using (parent_user_id = auth.uid());

-- ENROLLMENTS (read if parent owns child or teacher in class)
alter table enrollments enable row level security;
create policy "parent reads enrollment" on enrollments for select using (
  exists(select 1 from children ch where ch.id = enrollments.child_id and ch.parent_user_id = auth.uid())
  or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role = 'teacher')
);

-- ACTIVITIES + PROGRESS
alter table activities enable row level security; create policy "public read" on activities for select using (true);
alter table modules enable row level security; create policy "public read" on modules for select using (true);
alter table booklets enable row level security; create policy "public read" on booklets for select using (true);

alter table activity_progress enable row level security;
create policy "parent read/write child progress" on activity_progress for select using (is_parent_of_child(child_id));
create policy "insert own child progress" on activity_progress for insert with check (is_parent_of_child(child_id));
create policy "update own child progress" on activity_progress for update using (is_parent_of_child(child_id));

-- COMMUNITY
alter table posts enable row level security;
create policy "read class posts" on posts for select using (true); -- feed is public to cohort; filter in queries by class
create policy "create posts" on posts for insert with check (author_user_id = auth.uid());
create policy "edit own posts" on posts for update using (author_user_id = auth.uid());

alter table comments enable row level security;
create policy "read comments" on comments for select using (true);
create policy "create comments" on comments for insert with check (author_user_id = auth.uid());
create policy "edit own comments" on comments for update using (author_user_id = auth.uid());

alter table reactions enable row level security;
create policy "like" on reactions for insert with check (user_id = auth.uid());
create policy "see likes" on reactions for select using (true);

alter table reports enable row level security;
create policy "create report" on reports for insert with check (reporter_id = auth.uid());
create policy "admin read" on reports for select using (exists(select 1 from profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- CHATS
alter table threads enable row level security;
create policy "participants read threads" on threads for select using (
  exists(select 1 from thread_participants tp where tp.thread_id = threads.id and tp.user_id = auth.uid())
);
create policy "create thread" on threads for insert with check (created_by = auth.uid());

alter table thread_participants enable row level security;
create policy "participant read/write" on thread_participants for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table messages enable row level security;
create policy "read messages in joined threads" on messages for select using (
  exists(select 1 from thread_participants tp where tp.thread_id = messages.thread_id and tp.user_id = auth.uid())
);
create policy "send message" on messages for insert with check (
  exists(select 1 from thread_participants tp where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()) and author_id = auth.uid()
);

-- TOKENS
alter table token_accounts enable row level security;
create policy "parent reads own account" on token_accounts for select using (
  exists(select 1 from children ch where ch.id = token_accounts.child_id and ch.parent_user_id = auth.uid())
);

alter table token_transactions enable row level security;
create policy "parent reads own tx" on token_transactions for select using (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id where ta.child_id = token_transactions.account_id and ch.parent_user_id = auth.uid())
);

alter table redemptions enable row level security;
create policy "parent read own redemptions" on redemptions for select using (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id where ta.child_id = redemptions.account_id and ch.parent_user_id = auth.uid())
);
create policy "parent request redemption" on redemptions for insert with check (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id where ta.child_id = redemptions.account_id and ch.parent_user_id = auth.uid())
);
-- admin approves/fulfills via service role only

-- ANALYTICS & NOTIFICATIONS (read own)
alter table kpi_metrics enable row level security;
create policy "parent reads own metrics" on kpi_metrics for select using (
  exists(select 1 from children ch where ch.id = kpi_metrics.child_id and ch.parent_user_id = auth.uid())
);

alter table notifications enable row level security;
create policy "read own notifications" on notifications for select using (user_id = auth.uid());
```

> **Note:** Service‑role key is required server‑side for token deductions, leaderboard jobs, and moderation actions.

--

## 17) Localization & Accessibility
- EN and 繁體中文 with `i18next`. Resource bundles for UI copy and system messages (reports, moderation). Date/number formatting locale‑aware. All icons with accessibility labels; chart alternatives show percentile numbers.

---

## 18) Privacy & Compliance (HK PDPO)
- Explicit consent for child data and media uploads; parental control of display; default blur for child faces in community media.
- Retention: proofs kept 90 days; parents can delete; export on request.
- Access controls enforced via RLS; service role only server‑side.

---

## 19) Non‑Functional Requirements
- P95 API < 300 ms (cached reads), mobile bundle < 8 MB (release), offline tolerant for read‑only lists where possible, graceful degradation on low bandwidth.

---

## 20) Test Plan
- **Unit**: Pydantic models, token accounting, progress rules.
- **Integration**: RLS read/write (parent vs teacher), redemption flow, realtime subscription updates.
- **E2E**: Detox — onboarding → complete in‑app task → upload proof → see tokens increase → redeem stickers → see status update.

---

## 21) Milestones & Acceptance Criteria (AC)
**M1 — Foundations (Week 1)**
- Supabase schema + RLS applied; seed data present. **AC:** Can query booklets, create progress, and see tokens awarded in DB.

**M2 — Core App (Week 2–3)**
- Home, Learn, Community (Achievements, Forums, Chats), Games implemented. **AC:** Parent completes an activity and sees stars/tokens update in UI; can post and comment.

**M3 — Analytics & Tokens (Week 4)**
- Analytics charts and Tokens shop/history wired; redemption flow functional with optimistic UI. **AC:** Can redeem an item and see balance/history + status.

**M4 — Notifications & Teacher MVP (Week 5)**
- Push notifications for weekly challenge reminders and redemption status; Teacher read‑only views and chats. **AC:** Teacher can message a parent; parent receives push.

**M5 — Polish & Compliance (Week 6)**
- i18n finalized; accessibility pass; privacy controls; error states. **AC:** All listed events tracked; all AC above green.

---

## 22) Environment & DevOps
- **Env (mobile)**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`.
- **Env (api)**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (optional), `POSTHOG_KEY`, `EXPO_PUSH_KEY`.
- **GitHub Actions**: `api-ci.yml` (pytest, mypy), `mobile-ci.yml` (typecheck, lint, build), secrets for env.
- **Docker**: API Dockerfile + Compose for local.

---

## 23) Seed Content Hints
- Class “Sunny Hills K1”, booklet “Alphabet Time” (26 modules; current=12), sample activities (In‑App Task, Pen & Paper), weekly challenge “Family Reading Marathon”, token shop items (pencils/stickers/notebook/art box).

---

## 24) Open Questions (assumptions until updated)
- SuperAPP integration is placeholder OAuth + sync; exact API TBD.
- Redemption fulfillment is manual by staff; no shipping integration.
- Leaderboard visibility limited to percentile to avoid unhealthy competition.

---

**End of PRD** — Build according to these specs. When in doubt, prefer privacy, clarity, and parent effort minimization. 

