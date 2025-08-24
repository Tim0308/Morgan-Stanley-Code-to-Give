-- Learn Tab Demo Data Script
-- Run this directly in Supabase SQL Editor to populate demo data for the Learn page

-- Step 1: Clean up existing Learn tab data
DELETE FROM activity_progress;
DELETE FROM activities;
DELETE FROM modules;
DELETE FROM booklets;

-- Step 2: Create 4 sample booklets (optimized for demo)
INSERT INTO booklets (id, title, subtitle, week_start, week_end, locale, total_modules, subject)
VALUES 
    (gen_random_uuid(), 'Vocabulary Time', 'Learn new words and expand your vocabulary', '2025-08-19', '2025-08-25', 'en', 2, 'English'),
    (gen_random_uuid(), 'Sight Words Time', 'Master common sight words for reading fluency', '2025-08-19', '2025-08-25', 'en', 2, 'English'),
    (gen_random_uuid(), 'Reading Time', 'Build reading comprehension and fluency skills', '2025-08-19', '2025-08-25', 'en', 2, 'English'),
    (gen_random_uuid(), 'Phonics Time', 'Learn letter sounds and phonetic patterns', '2025-08-19', '2025-08-25', 'en', 2, 'English');

-- Step 3: Create modules (2 per booklet = 8 total)
WITH booklet_modules AS (
    SELECT 
        b.id as booklet_id,
        b.title as booklet_title,
        m.module_idx,
        CASE 
            WHEN b.title = 'Vocabulary Time' AND m.module_idx = 1 THEN 'Basic Animals'
            WHEN b.title = 'Vocabulary Time' AND m.module_idx = 2 THEN 'Colors and Shapes'
            WHEN b.title = 'Sight Words Time' AND m.module_idx = 1 THEN 'First Words'
            WHEN b.title = 'Sight Words Time' AND m.module_idx = 2 THEN 'Action Words'
            WHEN b.title = 'Reading Time' AND m.module_idx = 1 THEN 'Short Stories'
            WHEN b.title = 'Reading Time' AND m.module_idx = 2 THEN 'Picture Books'
            WHEN b.title = 'Phonics Time' AND m.module_idx = 1 THEN 'Letter Sounds A-M'
            WHEN b.title = 'Phonics Time' AND m.module_idx = 2 THEN 'Letter Sounds N-Z'
        END as module_title,
        CASE 
            WHEN b.title = 'Vocabulary Time' AND m.module_idx = 1 THEN 'Learn names and sounds of common animals'
            WHEN b.title = 'Vocabulary Time' AND m.module_idx = 2 THEN 'Learn basic colors and geometric shapes'
            WHEN b.title = 'Sight Words Time' AND m.module_idx = 1 THEN 'Learn your first 25 sight words'
            WHEN b.title = 'Sight Words Time' AND m.module_idx = 2 THEN 'Learn common action verbs'
            WHEN b.title = 'Reading Time' AND m.module_idx = 1 THEN 'Read and understand simple stories'
            WHEN b.title = 'Reading Time' AND m.module_idx = 2 THEN 'Use pictures to understand stories'
            WHEN b.title = 'Phonics Time' AND m.module_idx = 1 THEN 'Learn sounds for letters A through M'
            WHEN b.title = 'Phonics Time' AND m.module_idx = 2 THEN 'Learn sounds for letters N through Z'
        END as module_description
    FROM booklets b
    CROSS JOIN (VALUES (1), (2)) AS m(module_idx)
)
INSERT INTO modules (id, booklet_id, idx, title, description)
SELECT 
    gen_random_uuid(),
    booklet_id,
    module_idx,
    module_title,
    module_description
FROM booklet_modules;

-- Step 4: Create activities (2 per module = 16 total)
WITH activity_data AS (
    SELECT 
        m.id as module_id,
        b.title as booklet_title,
        m.title as module_title,
        m.idx as module_idx,
        a.activity_num,
        CASE 
            WHEN b.title = 'Vocabulary Time' AND m.idx = 1 AND a.activity_num = 1 THEN 'Learn names of farm animals'
            WHEN b.title = 'Vocabulary Time' AND m.idx = 1 AND a.activity_num = 2 THEN 'Match animals to their sounds'
            WHEN b.title = 'Vocabulary Time' AND m.idx = 2 AND a.activity_num = 1 THEN 'Learn primary and secondary colors'
            WHEN b.title = 'Vocabulary Time' AND m.idx = 2 AND a.activity_num = 2 THEN 'Find shapes in everyday objects'
            WHEN b.title = 'Sight Words Time' AND m.idx = 1 AND a.activity_num = 1 THEN 'Practice reading sight words quickly'
            WHEN b.title = 'Sight Words Time' AND m.idx = 1 AND a.activity_num = 2 THEN 'Play bingo with sight words'
            WHEN b.title = 'Sight Words Time' AND m.idx = 2 AND a.activity_num = 1 THEN 'Read stories with action words'
            WHEN b.title = 'Sight Words Time' AND m.idx = 2 AND a.activity_num = 2 THEN 'Act out action words while reading'
            WHEN b.title = 'Reading Time' AND m.idx = 1 AND a.activity_num = 1 THEN 'Read a simple story about a cat'
            WHEN b.title = 'Reading Time' AND m.idx = 1 AND a.activity_num = 2 THEN 'Answer questions about the cat story'
            WHEN b.title = 'Reading Time' AND m.idx = 2 AND a.activity_num = 1 THEN 'Look at pictures and predict the story'
            WHEN b.title = 'Reading Time' AND m.idx = 2 AND a.activity_num = 2 THEN 'Use pictures to retell the story'
            WHEN b.title = 'Phonics Time' AND m.idx = 1 AND a.activity_num = 1 THEN 'Learn sounds for first half of alphabet'
            WHEN b.title = 'Phonics Time' AND m.idx = 1 AND a.activity_num = 2 THEN 'Practice making letter sounds A-M'
            WHEN b.title = 'Phonics Time' AND m.idx = 2 AND a.activity_num = 1 THEN 'Learn sounds for second half of alphabet'
            WHEN b.title = 'Phonics Time' AND m.idx = 2 AND a.activity_num = 2 THEN 'Practice making letter sounds N-Z'
        END as activity_instructions
    FROM modules m
    JOIN booklets b ON m.booklet_id = b.id
    CROSS JOIN (VALUES (1), (2)) AS a(activity_num)
)
INSERT INTO activities (id, module_id, type, points, est_minutes, instructions, media)
SELECT 
    gen_random_uuid(),
    module_id,
    CASE WHEN activity_num = 1 THEN 'in_app'::task_type ELSE 'pen_paper'::task_type END,
    CASE WHEN activity_num = 1 THEN 10 ELSE 15 END,
    CASE WHEN activity_num = 1 THEN 20 ELSE 25 END,
    activity_instructions,
    '[]'::jsonb
FROM activity_data;

-- Step 5: Get child IDs for progress data
-- Using your specific user ID
DO $$
DECLARE
    sample_user_id UUID := 'cad48dd6-64b7-46c1-a4ec-016c60f8d435'; -- YOUR ACTUAL USER ID
    child1_id UUID;
    child2_id UUID;
    vocab_module1_id UUID;
    vocab_module2_id UUID;
    sight_module1_id UUID;
    reading_module1_id UUID;
BEGIN
    -- Get children for your specific user
    SELECT id INTO child1_id FROM children WHERE parent_user_id = sample_user_id AND nickname = 'Emma' LIMIT 1;
    SELECT id INTO child2_id FROM children WHERE parent_user_id = sample_user_id AND nickname = 'Liam' LIMIT 1;
    
    -- If no second child, use the first child for both
    IF child2_id IS NULL THEN
        child2_id := child1_id;
    END IF;
    
    IF child1_id IS NULL THEN
        RAISE EXCEPTION 'Children not found for user %. Please run seed_user_data.sql first.', sample_user_id;
    END IF;
    
    RAISE NOTICE '✅ Found children: Emma (%) and Liam (%)', child1_id, child2_id;
    
    -- Get module IDs
    SELECT m.id INTO vocab_module1_id 
    FROM modules m 
    JOIN booklets b ON m.booklet_id = b.id 
    WHERE b.title = 'Vocabulary Time' AND m.idx = 1;
    
    SELECT m.id INTO vocab_module2_id 
    FROM modules m 
    JOIN booklets b ON m.booklet_id = b.id 
    WHERE b.title = 'Vocabulary Time' AND m.idx = 2;
    
    SELECT m.id INTO sight_module1_id 
    FROM modules m 
    JOIN booklets b ON m.booklet_id = b.id 
    WHERE b.title = 'Sight Words Time' AND m.idx = 1;
    
    SELECT m.id INTO reading_module1_id 
    FROM modules m 
    JOIN booklets b ON m.booklet_id = b.id 
    WHERE b.title = 'Reading Time' AND m.idx = 1;
    
    -- Add progress for Emma (child1) - more advanced
    -- Complete Vocabulary Module 1 (2 activities)
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child1_id,
        a.id,
        'completed',
        85 + (random() * 15)::numeric,
        'Great work!',
        NOW() - (random() * INTERVAL '10 days')
    FROM activities a
    WHERE a.module_id = vocab_module1_id;
    
    -- Complete Sight Words Module 1 (2 activities)  
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child1_id,
        a.id,
        'completed',
        80 + (random() * 20)::numeric,
        'Excellent progress!',
        NOW() - (random() * INTERVAL '8 days')
    FROM activities a
    WHERE a.module_id = sight_module1_id;
    
    -- Complete Reading Module 1 (2 activities)
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child1_id,
        a.id,
        'completed',
        75 + (random() * 25)::numeric,
        'Keep up the good work!',
        NOW() - (random() * INTERVAL '5 days')
    FROM activities a
    WHERE a.module_id = reading_module1_id;
    
    -- Add 1 in-progress for Emma (first activity of Vocabulary Module 2)
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child1_id,
        a.id,
        'in_progress',
        NULL,
        'Working on it',
        NULL
    FROM activities a
    WHERE a.module_id = vocab_module2_id
    LIMIT 1;
    
    -- Add progress for Liam (child2) - less advanced  
    -- Complete 1 activity from Vocabulary Module 1
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child2_id,
        a.id,
        'completed',
        70 + (random() * 20)::numeric,
        'Nice job!',
        NOW() - (random() * INTERVAL '3 days')
    FROM activities a
    WHERE a.module_id = vocab_module1_id
    LIMIT 1;
    
    -- Add 1 in-progress for Liam (second activity of Vocabulary Module 1)
    INSERT INTO activity_progress (id, child_id, activity_id, status, score, notes, completed_at)
    SELECT 
        gen_random_uuid(),
        child2_id,
        a.id,
        'in_progress',
        NULL,
        'Started recently',
        NULL
    FROM activities a
    WHERE a.module_id = vocab_module1_id
    OFFSET 1 LIMIT 1;
    
END $$;

-- Step 6: Verify the data
SELECT 
    'Summary' as type,
    COUNT(*) as count
FROM booklets
UNION ALL
SELECT 'Modules', COUNT(*) FROM modules
UNION ALL  
SELECT 'Activities', COUNT(*) FROM activities
UNION ALL
SELECT 'Progress Records', COUNT(*) FROM activity_progress
UNION ALL
SELECT 'Completed Activities', COUNT(*) FROM activity_progress WHERE status = 'completed'
UNION ALL
SELECT 'In Progress Activities', COUNT(*) FROM activity_progress WHERE status = 'in_progress';

-- Show sample data structure
SELECT 
    b.title as booklet,
    m.title as module,
    m.idx as module_order,
    COUNT(a.id) as activities
FROM booklets b
LEFT JOIN modules m ON b.id = m.booklet_id
LEFT JOIN activities a ON m.id = a.module_id
GROUP BY b.title, m.title, m.idx
ORDER BY b.title, m.idx;
