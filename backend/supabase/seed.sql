-- Seed data for Project Reach Educational Platform
-- Run this after schema.sql and rls_policies.sql

-- Sample Classes
INSERT INTO classes (id, school, name, grade) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Sunny Hills', 'Sunny Hills K1', 'K1'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Rainbow Learning', 'Rainbow Learning K2', 'K2'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Bright Stars', 'Bright Stars K1', 'K1');

-- Sample Booklets
INSERT INTO booklets (id, title, subtitle, week_start, week_end, locale, total_modules, subject) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Alphabet Time', 'Learning Letters A-Z', '2025-01-06', '2025-01-12', 'en', 26, 'Reading'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Vocabulary Time', 'Building Word Knowledge', '2025-01-13', '2025-01-19', 'en', 20, 'Reading'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Sight Words Time', 'Common Word Recognition', '2025-01-20', '2025-01-26', 'en', 15, 'Reading'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Reading Time', 'Story Comprehension', '2025-01-27', '2025-02-02', 'en', 24, 'Reading');

-- Sample Modules for Alphabet Time
INSERT INTO modules (id, booklet_id, idx, title, description) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 'Letters A-E', 'Introduction to first five letters'),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 2, 'Letters F-J', 'Learning letters F through J'),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 3, 'Letters K-O', 'Middle alphabet letters'),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 12, 'Letters L-P Review', 'Review and practice');

-- Sample Activities
INSERT INTO activities (id, module_id, type, points, est_minutes, instructions, media) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'in_app', 5, 10, 'Practice letter recognition in the app', '[]'),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'pen_paper', 5, 15, 'Trace letters A-E on the worksheet', '[]'),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'in_app', 5, 10, 'Letter sound matching game', '[]'),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', 'audio', 10, 20, 'Listen to animal sounds exercise', '[]');

-- Sample Badges
INSERT INTO badges (id, name, criteria_json, icon_url) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '3-Week Streak', '{"type": "streak", "weeks": 3}', null),
  ('990e8400-e29b-41d4-a716-446655440002', 'Alphabet Master', '{"type": "booklet_complete", "booklet": "Alphabet Time"}', null),
  ('990e8400-e29b-41d4-a716-446655440003', 'Helper', '{"type": "helpful_answers", "count": 5}', null),
  ('990e8400-e29b-41d4-a716-446655440004', 'Booklet Champion', '{"type": "activities_complete", "count": 20}', null);

-- Sample Certificates
INSERT INTO certificates (id, title, description, image_url) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', 'Alphabet Master', 'Certificate of Achievement for completing Alphabet Time', null),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'Reading Champion', 'Certificate for excellent reading progress', null),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'Vocabulary Expert', 'Certificate for mastering vocabulary skills', null);

-- Sample Games
INSERT INTO games (id, title, description, difficulty, est_minutes) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'Family Reading Marathon', 'Read together for 30 minutes every day this week', 'Medium', 30),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'Word Detective', 'Find hidden words in picture scenes together', 'Easy', 10),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'Alphabet Race', 'Race to find objects starting with each letter', 'Easy', 15);

-- Sample Shop Items
INSERT INTO shop_items (id, name, category, price, is_active, inventory_qty) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'Colorful Pencils Set', 'Stationery', 50, true, 100),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'Fun Stickers Pack', 'Stationery', 30, true, 200),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'Mini Notebook', 'Stationery', 40, true, 150),
  ('cc0e8400-e29b-41d4-a716-446655440004', 'Reward Chart', 'Stationery', 25, true, 75),
  ('cc0e8400-e29b-41d4-a716-446655440005', 'Art Supply Box', 'Stationery', 100, true, 50);

-- Note: User-specific data (profiles, children, progress, etc.) will be created
-- when users sign up and start using the app. The above provides the foundation
-- content and shop items that all users can interact with. 