-- Sample User Data for Project Reach
-- Run this in Supabase SQL Editor after running the basic seed.sql
-- Replace the user_id with your actual auth user ID from Supabase Auth

-- STEP 1: Replace this with your actual user ID from Supabase Auth
-- You can find this in Authentication > Users in your Supabase dashboard
DO $$
DECLARE
    sample_user_id UUID := 'cad48dd6-64b7-46c1-a4ec-016c60f8d435'; -- YOUR ACTUAL USER ID
    child1_id UUID := gen_random_uuid();
    child2_id UUID := gen_random_uuid();
    class1_id UUID := '550e8400-e29b-41d4-a716-446655440001'; -- Sunny Hills K1
    class2_id UUID := '550e8400-e29b-41d4-a716-446655440002'; -- Rainbow Learning K2
BEGIN
    -- Insert sample profile
    INSERT INTO profiles (user_id, role, full_name, locale, school, grade) VALUES
    (sample_user_id, 'parent', 'John Doe', 'en', 'Sunny Hills', 'K1')
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        locale = EXCLUDED.locale,
        school = EXCLUDED.school,
        grade = EXCLUDED.grade;

    RAISE NOTICE '✅ Profile created for user: %', sample_user_id;

    -- Insert sample children
    INSERT INTO children (id, parent_user_id, nickname, age_band) VALUES
    (child1_id, sample_user_id, 'Emma', '5-6'),
    (child2_id, sample_user_id, 'Liam', '4-5');

    RAISE NOTICE '✅ Children created: Emma (%) and Liam (%)', child1_id, child2_id;

    -- Enroll children in classes
    INSERT INTO enrollments (child_id, class_id) VALUES
    (child1_id, class1_id),
    (child2_id, class2_id)
    ON CONFLICT (child_id, class_id) DO NOTHING;

    RAISE NOTICE '✅ Children enrolled in classes';

    -- Create token accounts
    INSERT INTO token_accounts (child_id, balance, weekly_earned, rank_percentile) VALUES
    (child1_id, 150, 45, 75.5),
    (child2_id, 200, 60, 65.5);

    RAISE NOTICE '✅ Token accounts created';

    -- Add activity progress
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at) VALUES
    -- Emma's progress
    (child1_id, '880e8400-e29b-41d4-a716-446655440001', 'completed', 85.0, 'Great work on activity 1!', NOW() - INTERVAL '2 days'),
    (child1_id, '880e8400-e29b-41d4-a716-446655440002', 'completed', 90.0, 'Great work on activity 2!', NOW() - INTERVAL '1 day'),
    (child1_id, '880e8400-e29b-41d4-a716-446655440003', 'completed', 95.0, 'Great work on activity 3!', NOW()),
    
    -- Liam's progress
    (child2_id, '880e8400-e29b-41d4-a716-446655440001', 'completed', 80.0, 'Good job on activity 1!', NOW() - INTERVAL '3 days'),
    (child2_id, '880e8400-e29b-41d4-a716-446655440002', 'in_progress', NULL, 'Working on it!', NULL),
    (child2_id, '880e8400-e29b-41d4-a716-446655440003', 'not_started', NULL, NULL, NULL);

    RAISE NOTICE '✅ Activity progress added';

    -- Award badges to Emma
    INSERT INTO child_badges (child_id, badge_id, awarded_at) VALUES
    (child1_id, '990e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '1 day'), -- Helper badge
    (child1_id, '990e8400-e29b-41d4-a716-446655440004', NOW()); -- Booklet Champion

    RAISE NOTICE '✅ Badges awarded';

    -- Add KPI metrics
    INSERT INTO kpi_metrics (child_id, metric, value_num, unit, period_start, period_end, source) VALUES
    -- Emma's metrics
    (child1_id, 'reading_minutes', 120, 'minutes', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child1_id, 'activities_completed', 8, 'count', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child1_id, 'streak_days', 5, 'days', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child1_id, 'weekly_progress', 75.5, 'percentage', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    
    -- Liam's metrics
    (child2_id, 'reading_minutes', 90, 'minutes', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child2_id, 'activities_completed', 5, 'count', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child2_id, 'streak_days', 3, 'days', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal'),
    (child2_id, 'weekly_progress', 60.0, 'percentage', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 'internal');

    RAISE NOTICE '✅ KPI metrics added';

    -- Add token transactions
    INSERT INTO token_transactions (account_id, delta, reason, ref_table, ref_id, actor_id, created_at) VALUES
    -- Emma's transactions
    (child1_id, 15, 'activity_complete', 'activities', '880e8400-e29b-41d4-a716-446655440001', sample_user_id, NOW() - INTERVAL '2 days'),
    (child1_id, 20, 'weekly_goal', NULL, NULL, sample_user_id, NOW() - INTERVAL '1 day'),
    (child1_id, 25, 'engagement_bonus', NULL, NULL, sample_user_id, NOW()),
    
    -- Liam's transactions
    (child2_id, 15, 'activity_complete', 'activities', '880e8400-e29b-41d4-a716-446655440001', sample_user_id, NOW() - INTERVAL '3 days'),
    (child2_id, 20, 'weekly_goal', NULL, NULL, sample_user_id, NOW() - INTERVAL '2 days'),
    (child2_id, 25, 'helpful_answer', NULL, NULL, sample_user_id, NOW() - INTERVAL '1 day');

    RAISE NOTICE '✅ Token transactions added';

    -- Add some game instances and progress
    INSERT INTO game_instances (id, game_id, week_start, week_end, class_id, status) VALUES
    (gen_random_uuid(), 'bb0e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, class1_id, 'active'),
    (gen_random_uuid(), 'bb0e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, class2_id, 'active');

    RAISE NOTICE '✅ Game instances created';

    -- Add some leaderboard entries
    INSERT INTO leaderboards (period_start, period_end, class_id, child_id, rank, percentile) VALUES
    (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, class1_id, child1_id, 3, 75.5),
    (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, class2_id, child2_id, 5, 65.0);

    RAISE NOTICE '✅ Leaderboard entries added';

    RAISE NOTICE '';
    RAISE NOTICE '🎉 Sample data insertion completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Summary of created data:';
    RAISE NOTICE '  👤 Profile: John Doe (User ID: %)', sample_user_id;
    RAISE NOTICE '  👶 Children: Emma and Liam';
    RAISE NOTICE '  📚 Activity Progress: 6 records';
    RAISE NOTICE '  🏅 Badges: 2 awarded to Emma';
    RAISE NOTICE '  🪙 Token Accounts: 2 accounts (Emma: 150 tokens, Liam: 200 tokens)';
    RAISE NOTICE '  💰 Token Transactions: 6 transactions';
    RAISE NOTICE '  📊 KPI Metrics: 8 metrics';
    RAISE NOTICE '  🎮 Game Instances: 2 active games';
    RAISE NOTICE '  🏆 Leaderboard: 2 entries';
    RAISE NOTICE '';
    RAISE NOTICE '✨ You should now see actual data in your app instead of N/A values!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update the sample_user_id at the top of this script with your real user ID';
    RAISE NOTICE '2. Re-run this script if needed';
    RAISE NOTICE '3. Check your app - the Home and Learn pages should now show real data!';

END $$;
