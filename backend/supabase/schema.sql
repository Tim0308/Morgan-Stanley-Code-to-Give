-- Project Reach Database Schema
-- Educational Parent Engagement Platform

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