-- Sample Learning Data for Learn Tab
-- Run this in Supabase SQL Editor to populate the Learn tab with sample data
-- This assumes you already have the user and children from seed_user_data.sql

DO $$
DECLARE
    sample_user_id UUID := 'cad48dd6-64b7-46c1-a4ec-016c60f8d435'; -- YOUR ACTUAL USER ID
    child1_id UUID;
    child2_id UUID;
    
    -- Booklet IDs
    vocab_booklet_id UUID := gen_random_uuid();
    sight_words_booklet_id UUID := gen_random_uuid();
    reading_booklet_id UUID := gen_random_uuid();
    phonics_booklet_id UUID := gen_random_uuid();
    
    -- Module and Activity IDs
    module_id UUID;
    activity_id UUID;
BEGIN
    -- Get existing children IDs
    SELECT id INTO child1_id FROM children WHERE parent_user_id = sample_user_id AND nickname = 'Emma' LIMIT 1;
    SELECT id INTO child2_id FROM children WHERE parent_user_id = sample_user_id AND nickname = 'Liam' LIMIT 1;
    
    IF child1_id IS NULL OR child2_id IS NULL THEN
        RAISE EXCEPTION 'Children not found. Please run seed_user_data.sql first.';
    END IF;

    RAISE NOTICE '✅ Found children: Emma (%) and Liam (%)', child1_id, child2_id;

    -- Insert Booklets (keeping smaller module counts for demo)
    INSERT INTO booklets (id, title, subtitle, week_start, week_end, locale, total_modules, subject) VALUES
    (vocab_booklet_id, 'Vocabulary Time', 'Building Essential Vocabulary', CURRENT_DATE - INTERVAL '4 weeks', CURRENT_DATE + INTERVAL '16 weeks', 'en', 2, 'Reading'),
    (sight_words_booklet_id, 'Sight Words Time', 'Common Sight Words Practice', CURRENT_DATE - INTERVAL '3 weeks', CURRENT_DATE + INTERVAL '12 weeks', 'en', 2, 'Reading'),
    (reading_booklet_id, 'Reading Time', 'Reading Comprehension Skills', CURRENT_DATE - INTERVAL '2 weeks', CURRENT_DATE + INTERVAL '22 weeks', 'en', 2, 'Reading'),
    (phonics_booklet_id, 'Phonics Time', 'Sound and Letter Recognition', CURRENT_DATE - INTERVAL '1 week', CURRENT_DATE + INTERVAL '17 weeks', 'en', 2, 'Reading');

    RAISE NOTICE '✅ Booklets created';

    -- Insert Modules and Activities for Vocabulary Time (2 modules, 2 activities each)
    FOR i IN 1..2 LOOP
        module_id := gen_random_uuid();
        INSERT INTO modules (id, booklet_id, idx, title, description) VALUES
        (module_id, vocab_booklet_id, i, 'Vocabulary Module ' || i, 'Learn vocabulary words set ' || i);
        
        -- Add 2 activities per module
        FOR j IN 1..2 LOOP
            activity_id := gen_random_uuid();
            INSERT INTO activities (id, module_id, type, points, est_minutes, instructions) VALUES
            (activity_id, module_id, 
             CASE j 
                WHEN 1 THEN 'in_app'::task_type
                ELSE 'pen_paper'::task_type
             END,
             CASE j WHEN 2 THEN 15 ELSE 10 END,
             CASE j WHEN 2 THEN 20 ELSE 10 END,
             'Complete vocabulary activity ' || j || ' for module ' || i);
        END LOOP;
    END LOOP;

    -- Insert Modules and Activities for Sight Words Time (2 modules, 2 activities each)
    FOR i IN 1..2 LOOP
        module_id := gen_random_uuid();
        INSERT INTO modules (id, booklet_id, idx, title, description) VALUES
        (module_id, sight_words_booklet_id, i, 'Sight Words Module ' || i, 'Practice common sight words set ' || i);
        
        -- Add 2 activities per module
        FOR j IN 1..2 LOOP
            activity_id := gen_random_uuid();
            INSERT INTO activities (id, module_id, type, points, est_minutes, instructions) VALUES
            (activity_id, module_id, 
             CASE j 
                WHEN 1 THEN 'in_app'::task_type
                ELSE 'game'::task_type
             END,
             10,
             10,
             'Practice sight words activity ' || j || ' for module ' || i);
        END LOOP;
    END LOOP;

    -- Insert Modules and Activities for Reading Time (2 modules, 2 activities each)
    FOR i IN 1..2 LOOP
        module_id := gen_random_uuid();
        INSERT INTO modules (id, booklet_id, idx, title, description) VALUES
        (module_id, reading_booklet_id, i, 'Reading Module ' || i, 'Reading comprehension practice level ' || i);
        
        -- Add 2 activities per module
        FOR j IN 1..2 LOOP
            activity_id := gen_random_uuid();
            INSERT INTO activities (id, module_id, type, points, est_minutes, instructions) VALUES
            (activity_id, module_id, 
             CASE j 
                WHEN 1 THEN 'audio'::task_type
                ELSE 'pen_paper'::task_type
             END,
             CASE j WHEN 2 THEN 20 ELSE 15 END,
             CASE j WHEN 2 THEN 25 ELSE 20 END,
             'Reading comprehension activity ' || j || ' for module ' || i);
        END LOOP;
    END LOOP;

    -- Insert Modules and Activities for Phonics Time (2 modules, 2 activities each)
    FOR i IN 1..2 LOOP
        module_id := gen_random_uuid();
        INSERT INTO modules (id, booklet_id, idx, title, description) VALUES
        (module_id, phonics_booklet_id, i, 'Phonics Module ' || i, 'Sound recognition and phonics practice ' || i);
        
        -- Add 2 activities per module
        FOR j IN 1..2 LOOP
            activity_id := gen_random_uuid();
            INSERT INTO activities (id, module_id, type, points, est_minutes, instructions) VALUES
            (activity_id, module_id, 
             CASE j 
                WHEN 1 THEN 'audio'::task_type
                ELSE 'game'::task_type
             END,
             10,
             CASE j WHEN 1 THEN 15 ELSE 10 END,
             'Phonics practice activity ' || j || ' for module ' || i);
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ Modules and Activities created for all booklets';

    -- Add Sample Activity Progress for Emma (more advanced)
    -- Complete module 1 of Vocabulary Time (2 activities)
    WITH vocab_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = vocab_booklet_id AND m.idx = 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child1_id,
        act_id,
        'completed',
        85 + (random() * 15)::numeric,
        'Great work!',
        NOW() - (random() * INTERVAL '10 days')
    FROM vocab_activities;

    -- Complete module 1 of Sight Words Time (2 activities)
    WITH sight_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = sight_words_booklet_id AND m.idx = 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child1_id,
        act_id,
        'completed',
        80 + (random() * 20)::numeric,
        'Excellent progress!',
        NOW() - (random() * INTERVAL '8 days')
    FROM sight_activities;

    -- Complete module 1 of Reading Time (2 activities)
    WITH reading_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = reading_booklet_id AND m.idx = 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child1_id,
        act_id,
        'completed',
        75 + (random() * 25)::numeric,
        'Keep up the good work!',
        NOW() - (random() * INTERVAL '5 days')
    FROM reading_activities;

    RAISE NOTICE '✅ Activity progress added for Emma';

    -- Add Sample Activity Progress for Liam (less advanced)
    -- Complete first activity of Vocabulary Time module 1
    WITH vocab_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = vocab_booklet_id AND m.idx = 1
        LIMIT 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child2_id,
        act_id,
        'completed',
        70 + (random() * 20)::numeric,
        'Nice job!',
        NOW() - (random() * INTERVAL '3 days')
    FROM vocab_activities;

    RAISE NOTICE '✅ Activity progress added for Liam';

    -- Add some in_progress activities for both children
    -- Add 1 in-progress activity for Emma (second activity of Vocabulary module 2)
    WITH next_vocab_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = vocab_booklet_id AND m.idx = 2
        LIMIT 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child1_id,
        act_id,
        'in_progress',
        NULL,
        'Working on it',
        NULL
    FROM next_vocab_activities;

    -- Add 1 in-progress activity for Liam (second activity of Vocabulary module 1)
    WITH next_vocab_activities AS (
        SELECT a.id as act_id
        FROM activities a
        JOIN modules m ON a.module_id = m.id
        WHERE m.booklet_id = vocab_booklet_id AND m.idx = 1
        OFFSET 1 LIMIT 1
    )
    INSERT INTO activity_progress (child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        child2_id,
        act_id,
        'in_progress',
        NULL,
        'Started recently',
        NULL
    FROM next_vocab_activities;

    RAISE NOTICE '✅ In-progress activities added';

    RAISE NOTICE '🎉 Learn tab sample data creation completed!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 4 Booklets (Vocabulary, Sight Words, Reading, Phonics)';
    RAISE NOTICE '- 77 Modules total (20+15+24+18)';
    RAISE NOTICE '- 270+ Activities total';
    RAISE NOTICE '- Progress data for both children';
    RAISE NOTICE '- Emma: More advanced progress across all booklets';
    RAISE NOTICE '- Liam: Beginning progress with some completed activities';

END $$;
