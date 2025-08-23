-- Combined script: Cleanup old Learn tab data and insert new optimized sample data
-- This ensures we have a clean, manageable dataset for demo purposes

-- Step 1: Cleanup existing data
DO $$
BEGIN
    RAISE NOTICE '🧹 Starting Learn tab data cleanup...';

    -- Delete activity progress (must be first due to foreign keys)
    DELETE FROM activity_progress;
    RAISE NOTICE '✅ Deleted activity progress records';

    -- Delete activities
    DELETE FROM activities;
    RAISE NOTICE '✅ Deleted activities';

    -- Delete modules  
    DELETE FROM modules;
    RAISE NOTICE '✅ Deleted modules';

    -- Delete booklets
    DELETE FROM booklets;
    RAISE NOTICE '✅ Deleted booklets';

    RAISE NOTICE '🎉 Learn tab data cleanup completed successfully!';

END $$;

-- Step 2: Insert new optimized sample data
-- This creates a manageable demo dataset with 4 booklets, 8 modules total, 16 activities total

DO $$
DECLARE
    parent_id UUID;
    child1_id UUID;
    child2_id UUID;
    vocab_booklet_id UUID;
    sight_words_booklet_id UUID;
    reading_booklet_id UUID;
    phonics_booklet_id UUID;
    mod_id UUID;
BEGIN
    RAISE NOTICE '📚 Starting optimized Learn tab sample data creation...';

    -- Get parent and children IDs (assumes they exist from previous setup)
    SELECT id INTO parent_id FROM auth.users WHERE email = 'parent@example.com' LIMIT 1;
    
    IF parent_id IS NULL THEN
        RAISE EXCEPTION 'Parent user not found. Please run seed_user_data.sql first.';
    END IF;

    SELECT id INTO child1_id FROM children WHERE parent_id = parent_id AND name = 'Emma' LIMIT 1;
    SELECT id INTO child2_id FROM children WHERE parent_id = parent_id AND name = 'Liam' LIMIT 1;

    IF child1_id IS NULL OR child2_id IS NULL THEN
        RAISE EXCEPTION 'Children not found. Please run seed_user_data.sql first.';
    END IF;

    RAISE NOTICE '✅ Found parent and children users';

    -- Create 4 Sample Booklets (2 modules each = 8 modules total)
    INSERT INTO booklets (title, description, grade_level, subject, total_modules, estimated_hours, difficulty_level, learning_objectives, cover_image_url)
    VALUES 
        ('Vocabulary Time', 'Learn new words and expand your vocabulary', 'Grade 1', 'English', 2, 4, 'beginner', ARRAY['Learn 50+ new vocabulary words', 'Understand word meanings in context'], 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
        ('Sight Words Time', 'Master common sight words for reading fluency', 'Grade 1', 'English', 2, 3, 'beginner', ARRAY['Recognize 100+ sight words instantly', 'Improve reading fluency'], 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400'),
        ('Reading Time', 'Build reading comprehension and fluency skills', 'Grade 2', 'English', 2, 6, 'intermediate', ARRAY['Read grade-appropriate texts', 'Answer comprehension questions', 'Build reading stamina'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
        ('Phonics Time', 'Learn letter sounds and phonetic patterns', 'Kindergarten', 'English', 2, 5, 'beginner', ARRAY['Master all letter sounds', 'Blend sounds to read words', 'Decode unfamiliar words'], 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400')
    RETURNING id INTO vocab_booklet_id;

    -- Get the IDs of all booklets
    SELECT id INTO vocab_booklet_id FROM booklets WHERE title = 'Vocabulary Time';
    SELECT id INTO sight_words_booklet_id FROM booklets WHERE title = 'Sight Words Time';  
    SELECT id INTO reading_booklet_id FROM booklets WHERE title = 'Reading Time';
    SELECT id INTO phonics_booklet_id FROM booklets WHERE title = 'Phonics Time';

    RAISE NOTICE '✅ Created 4 booklets with 2 modules each';

    -- Create 2 modules for Vocabulary Time booklet
    INSERT INTO modules (booklet_id, title, description, idx, estimated_minutes, learning_objectives)
    VALUES 
        (vocab_booklet_id, 'Basic Animals', 'Learn names and sounds of common animals', 1, 45, ARRAY['Identify 10 animal names', 'Match animals to their sounds']),
        (vocab_booklet_id, 'Colors and Shapes', 'Learn basic colors and geometric shapes', 2, 45, ARRAY['Name 8 primary colors', 'Identify 5 basic shapes']);

    -- Create 2 modules for Sight Words Time booklet  
    INSERT INTO modules (booklet_id, title, description, idx, estimated_minutes, learning_objectives)
    VALUES 
        (sight_words_booklet_id, 'First Words', 'Learn your first 25 sight words', 1, 30, ARRAY['Read 25 sight words instantly']),
        (sight_words_booklet_id, 'Action Words', 'Learn common action verbs', 2, 30, ARRAY['Recognize action verbs in sentences']);

    -- Create 2 modules for Reading Time booklet
    INSERT INTO modules (booklet_id, title, description, idx, estimated_minutes, learning_objectives) 
    VALUES 
        (reading_booklet_id, 'Short Stories', 'Read and understand simple stories', 1, 60, ARRAY['Read 3-sentence stories', 'Answer who/what questions']),
        (reading_booklet_id, 'Picture Books', 'Use pictures to understand stories', 2, 60, ARRAY['Make predictions from pictures', 'Retell simple stories']);

    -- Create 2 modules for Phonics Time booklet
    INSERT INTO modules (booklet_id, title, description, idx, estimated_minutes, learning_objectives)
    VALUES 
        (phonics_booklet_id, 'Letter Sounds A-M', 'Learn sounds for letters A through M', 1, 40, ARRAY['Say sounds for letters A-M']),
        (phonics_booklet_id, 'Letter Sounds N-Z', 'Learn sounds for letters N through Z', 2, 40, ARRAY['Say sounds for letters N-Z']);

    RAISE NOTICE '✅ Created 8 modules (2 per booklet)';

    -- Create 2 activities for each module (16 activities total)
    
    -- Vocabulary Time - Module 1 (Basic Animals)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = vocab_booklet_id AND idx = 1;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Animal Names', 'Learn names of farm animals', 'lesson', 'https://example.com/vocab/animals1', 20, 10),
        (mod_id, 'Animal Sounds', 'Match animals to their sounds', 'exercise', 'https://example.com/vocab/animals2', 25, 15);

    -- Vocabulary Time - Module 2 (Colors and Shapes)  
    SELECT id INTO mod_id FROM modules WHERE booklet_id = vocab_booklet_id AND idx = 2;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Rainbow Colors', 'Learn primary and secondary colors', 'lesson', 'https://example.com/vocab/colors1', 20, 10),
        (mod_id, 'Shape Hunt', 'Find shapes in everyday objects', 'game', 'https://example.com/vocab/shapes1', 25, 15);

    -- Sight Words Time - Module 1 (First Words)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = sight_words_booklet_id AND idx = 1;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Word Flash Cards', 'Practice reading sight words quickly', 'exercise', 'https://example.com/sight/flash1', 15, 10),
        (mod_id, 'Word Bingo', 'Play bingo with sight words', 'game', 'https://example.com/sight/bingo1', 15, 10);

    -- Sight Words Time - Module 2 (Action Words)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = sight_words_booklet_id AND idx = 2; 
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Action Stories', 'Read stories with action words', 'lesson', 'https://example.com/sight/actions1', 15, 10),
        (mod_id, 'Move and Read', 'Act out action words while reading', 'exercise', 'https://example.com/sight/actions2', 15, 10);

    -- Reading Time - Module 1 (Short Stories)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = reading_booklet_id AND idx = 1;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'The Cat Story', 'Read a simple story about a cat', 'lesson', 'https://example.com/reading/cat1', 30, 15),
        (mod_id, 'Story Questions', 'Answer questions about the cat story', 'assessment', 'https://example.com/reading/cat_quiz', 30, 20);

    -- Reading Time - Module 2 (Picture Books)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = reading_booklet_id AND idx = 2;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Picture Walk', 'Look at pictures and predict the story', 'lesson', 'https://example.com/reading/pictures1', 30, 15),
        (mod_id, 'Tell the Story', 'Use pictures to retell the story', 'exercise', 'https://example.com/reading/retell1', 30, 15);

    -- Phonics Time - Module 1 (Letter Sounds A-M)
    SELECT id INTO mod_id FROM modules WHERE booklet_id = phonics_booklet_id AND idx = 1;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Letters A-M', 'Learn sounds for first half of alphabet', 'lesson', 'https://example.com/phonics/am1', 20, 10),
        (mod_id, 'Sound Practice A-M', 'Practice making letter sounds A-M', 'exercise', 'https://example.com/phonics/am2', 20, 15);

    -- Phonics Time - Module 2 (Letter Sounds N-Z)  
    SELECT id INTO mod_id FROM modules WHERE booklet_id = phonics_booklet_id AND idx = 2;
    INSERT INTO activities (module_id, title, description, task_type, content_url, estimated_minutes, points_value)
    VALUES 
        (mod_id, 'Letters N-Z', 'Learn sounds for second half of alphabet', 'lesson', 'https://example.com/phonics/nz1', 20, 10),
        (mod_id, 'Sound Practice N-Z', 'Practice making letter sounds N-Z', 'exercise', 'https://example.com/phonics/nz2', 20, 15);

    RAISE NOTICE '✅ Created 16 activities (2 per module)';

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

    RAISE NOTICE '✅ In-progress activities added for both children';
    
    RAISE NOTICE '🎉 Optimized Learn tab sample data created successfully!';
    RAISE NOTICE 'Summary: 4 booklets, 8 modules, 16 activities, realistic progress for 2 children';

END $$;
