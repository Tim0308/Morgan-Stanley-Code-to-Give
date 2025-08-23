-- Row Level Security Policies for Project Reach
-- Run this after creating the schema

-- Helper function: check if user is parent of child
create or replace function is_parent_of_child(c uuid) returns boolean language sql stable as $$
  select exists(select 1 from children ch where ch.id = c and ch.parent_user_id = auth.uid());
$$;

-- PROFILES
alter table profiles enable row level security;
create policy "own profile" on profiles for select using (user_id = auth.uid());
create policy "update own profile" on profiles for update using (user_id = auth.uid());
create policy "insert own profile" on profiles for insert with check (user_id = auth.uid());

-- CHILDREN
alter table children enable row level security;
create policy "parent reads own children" on children for select using (parent_user_id = auth.uid());
create policy "parent writes own children" on children for insert with check (parent_user_id = auth.uid());
create policy "parent updates own children" on children for update using (parent_user_id = auth.uid());

-- CLASSES (public read for enrollment)
alter table classes enable row level security;
create policy "public read classes" on classes for select using (true);

-- ENROLLMENTS (read if parent owns child or teacher in class)
alter table enrollments enable row level security;
create policy "parent reads enrollment" on enrollments for select using (
  exists(select 1 from children ch where ch.id = enrollments.child_id and ch.parent_user_id = auth.uid())
  or exists(select 1 from profiles p where p.user_id = auth.uid() and p.role = 'teacher')
);
create policy "parent enrolls child" on enrollments for insert with check (
  exists(select 1 from children ch where ch.id = enrollments.child_id and ch.parent_user_id = auth.uid())
);

-- CONTENT (public read)
alter table booklets enable row level security; 
create policy "public read booklets" on booklets for select using (true);

alter table modules enable row level security; 
create policy "public read modules" on modules for select using (true);

alter table activities enable row level security; 
create policy "public read activities" on activities for select using (true);

-- ACTIVITY PROGRESS
alter table activity_progress enable row level security;
create policy "parent read/write child progress" on activity_progress for select using (is_parent_of_child(child_id));
create policy "insert own child progress" on activity_progress for insert with check (is_parent_of_child(child_id));
create policy "update own child progress" on activity_progress for update using (is_parent_of_child(child_id));

-- BADGES & CERTIFICATES
alter table badges enable row level security;
create policy "public read badges" on badges for select using (true);

alter table child_badges enable row level security;
create policy "parent reads child badges" on child_badges for select using (is_parent_of_child(child_id));

alter table certificates enable row level security;
create policy "public read certificates" on certificates for select using (true);

alter table child_certificates enable row level security;
create policy "parent reads child certificates" on child_certificates for select using (is_parent_of_child(child_id));

-- GAMES
alter table games enable row level security;
create policy "public read games" on games for select using (true);

alter table game_instances enable row level security;
create policy "public read game instances" on game_instances for select using (true);

alter table game_progress enable row level security;
create policy "parent read/write game progress" on game_progress for select using (is_parent_of_child(child_id));
create policy "parent update game progress" on game_progress for all using (is_parent_of_child(child_id));

-- COMMUNITY
alter table posts enable row level security;
create policy "read class posts" on posts for select using (true); -- feed is public to cohort
create policy "create posts" on posts for insert with check (author_user_id = auth.uid());
create policy "edit own posts" on posts for update using (author_user_id = auth.uid());

alter table comments enable row level security;
create policy "read comments" on comments for select using (true);
create policy "create comments" on comments for insert with check (author_user_id = auth.uid());
create policy "edit own comments" on comments for update using (author_user_id = auth.uid());

alter table reactions enable row level security;
create policy "like posts" on reactions for insert with check (user_id = auth.uid());
create policy "see likes" on reactions for select using (true);
create policy "unlike posts" on reactions for delete using (user_id = auth.uid());

alter table reports enable row level security;
create policy "create report" on reports for insert with check (reporter_id = auth.uid());
create policy "admin read reports" on reports for select using (
  exists(select 1 from profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

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
  exists(select 1 from thread_participants tp where tp.thread_id = messages.thread_id and tp.user_id = auth.uid()) 
  and author_id = auth.uid()
);

-- TOKENS
alter table token_accounts enable row level security;
create policy "parent reads own account" on token_accounts for select using (
  exists(select 1 from children ch where ch.id = token_accounts.child_id and ch.parent_user_id = auth.uid())
);

alter table token_transactions enable row level security;
create policy "parent reads own tx" on token_transactions for select using (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id 
    where ta.child_id = token_transactions.account_id and ch.parent_user_id = auth.uid())
);

alter table shop_items enable row level security;
create policy "public read shop items" on shop_items for select using (is_active = true);

alter table redemptions enable row level security;
create policy "parent read own redemptions" on redemptions for select using (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id 
    where ta.child_id = redemptions.account_id and ch.parent_user_id = auth.uid())
);
create policy "parent request redemption" on redemptions for insert with check (
  exists(select 1 from token_accounts ta join children ch on ch.id = ta.child_id 
    where ta.child_id = redemptions.account_id and ch.parent_user_id = auth.uid())
);

alter table leaderboards enable row level security;
create policy "read class leaderboards" on leaderboards for select using (true);

-- ANALYTICS & NOTIFICATIONS (read own)
alter table kpi_metrics enable row level security;
create policy "parent reads own metrics" on kpi_metrics for select using (
  exists(select 1 from children ch where ch.id = kpi_metrics.child_id and ch.parent_user_id = auth.uid())
);

alter table external_integrations enable row level security;
create policy "read integrations" on external_integrations for select using (true);

alter table external_metrics enable row level security;
create policy "parent reads own external metrics" on external_metrics for select using (
  exists(select 1 from children ch where ch.id = external_metrics.child_id and ch.parent_user_id = auth.uid())
);

alter table notifications enable row level security;
create policy "read own notifications" on notifications for select using (user_id = auth.uid());
create policy "update own notifications" on notifications for update using (user_id = auth.uid()); 