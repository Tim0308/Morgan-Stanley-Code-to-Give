-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  type USER-DEFINED NOT NULL,
  points integer DEFAULT 5,
  est_minutes integer DEFAULT 10,
  instructions text,
  media jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.activity_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  status text DEFAULT 'completed'::text CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text])),
  proof_url text,
  score numeric,
  notes text,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_progress_pkey PRIMARY KEY (id),
  CONSTRAINT activity_progress_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
  CONSTRAINT activity_progress_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  criteria_json jsonb NOT NULL,
  icon_url text,
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.booklets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  week_start date,
  week_end date,
  locale text DEFAULT 'en'::text,
  total_modules integer,
  subject text,
  CONSTRAINT booklets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.child_badges (
  child_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT child_badges_pkey PRIMARY KEY (child_id, badge_id),
  CONSTRAINT child_badges_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
  CONSTRAINT child_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id)
);
CREATE TABLE public.child_certificates (
  child_id uuid NOT NULL,
  certificate_id uuid NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT child_certificates_pkey PRIMARY KEY (child_id, certificate_id),
  CONSTRAINT child_certificates_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.certificates(id),
  CONSTRAINT child_certificates_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);
CREATE TABLE public.children (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL,
  nickname text,
  age_band text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT children_pkey PRIMARY KEY (id),
  CONSTRAINT children_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school text NOT NULL,
  name text NOT NULL,
  grade text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  author_user_id uuid,
  content text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES auth.users(id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.enrollments (
  child_id uuid NOT NULL,
  class_id uuid NOT NULL,
  CONSTRAINT enrollments_pkey PRIMARY KEY (child_id, class_id),
  CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT enrollments_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);
CREATE TABLE public.external_integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  status text,
  last_sync_at timestamp with time zone,
  auth_type text,
  external_user_id text,
  CONSTRAINT external_integrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.external_metrics (
  child_id uuid NOT NULL,
  integration_id uuid NOT NULL,
  metric text NOT NULL,
  value_num numeric,
  recorded_at timestamp with time zone NOT NULL,
  meta jsonb,
  CONSTRAINT external_metrics_pkey PRIMARY KEY (child_id, integration_id, metric, recorded_at),
  CONSTRAINT external_metrics_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
  CONSTRAINT external_metrics_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.external_integrations(id)
);
CREATE TABLE public.game_instances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid,
  week_start date,
  week_end date,
  class_id uuid,
  status text DEFAULT 'active'::text,
  CONSTRAINT game_instances_pkey PRIMARY KEY (id),
  CONSTRAINT game_instances_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT game_instances_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.game_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instance_id uuid,
  child_id uuid,
  days_done integer DEFAULT 0,
  last_day date,
  is_completed boolean DEFAULT false,
  CONSTRAINT game_progress_pkey PRIMARY KEY (id),
  CONSTRAINT game_progress_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
  CONSTRAINT game_progress_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES public.game_instances(id)
);
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  difficulty text,
  est_minutes integer,
  CONSTRAINT games_pkey PRIMARY KEY (id)
);
CREATE TABLE public.kpi_metrics (
  child_id uuid NOT NULL,
  metric text NOT NULL,
  value_num numeric,
  unit text,
  period_start date NOT NULL,
  period_end date,
  source text DEFAULT 'internal'::text,
  CONSTRAINT kpi_metrics_pkey PRIMARY KEY (child_id, metric, period_start),
  CONSTRAINT kpi_metrics_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);
CREATE TABLE public.leaderboards (
  period_start date NOT NULL,
  period_end date,
  class_id uuid NOT NULL,
  child_id uuid NOT NULL,
  rank integer,
  percentile numeric,
  CONSTRAINT leaderboards_pkey PRIMARY KEY (period_start, class_id, child_id),
  CONSTRAINT leaderboards_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT leaderboards_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  thread_id uuid,
  author_id uuid,
  body text,
  media jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id),
  CONSTRAINT messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  booklet_id uuid,
  idx integer NOT NULL,
  title text,
  description text,
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_booklet_id_fkey FOREIGN KEY (booklet_id) REFERENCES public.booklets(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text,
  payload jsonb,
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_user_id uuid,
  class_id uuid,
  type USER-DEFINED NOT NULL,
  content text,
  media jsonb DEFAULT '[]'::jsonb,
  anonymous boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT posts_author_user_id_fkey FOREIGN KEY (author_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'parent'::role,
  full_name text,
  locale text DEFAULT 'en'::text,
  school text,
  grade text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  type text DEFAULT 'like'::text,
  CONSTRAINT reactions_pkey PRIMARY KEY (id),
  CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid,
  item_id uuid,
  qty integer DEFAULT 1,
  status USER-DEFINED DEFAULT 'requested'::redemption_status,
  requested_at timestamp with time zone DEFAULT now(),
  fulfilled_at timestamp with time zone,
  notes text,
  CONSTRAINT redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT redemptions_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.shop_items(id),
  CONSTRAINT redemptions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.token_accounts(child_id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_type text CHECK (target_type = ANY (ARRAY['post'::text, 'comment'::text])),
  target_id uuid NOT NULL,
  reporter_id uuid,
  reason text,
  status text DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id)
);
CREATE TABLE public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  price integer NOT NULL,
  is_active boolean DEFAULT true,
  inventory_qty integer,
  CONSTRAINT shop_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.thread_participants (
  thread_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone,
  CONSTRAINT thread_participants_pkey PRIMARY KEY (thread_id, user_id),
  CONSTRAINT thread_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT thread_participants_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(id)
);
CREATE TABLE public.threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text DEFAULT 'direct'::text CHECK (type = ANY (ARRAY['direct'::text, 'class'::text])),
  class_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT threads_pkey PRIMARY KEY (id),
  CONSTRAINT threads_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT threads_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.token_accounts (
  child_id uuid NOT NULL,
  balance integer DEFAULT 0,
  weekly_earned integer DEFAULT 0,
  rank_percentile numeric,
  CONSTRAINT token_accounts_pkey PRIMARY KEY (child_id),
  CONSTRAINT token_accounts_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id)
);
CREATE TABLE public.token_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid,
  delta integer NOT NULL,
  reason USER-DEFINED NOT NULL,
  ref_table text,
  ref_id uuid,
  actor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT token_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT token_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.token_accounts(child_id),
  CONSTRAINT token_transactions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id)
);