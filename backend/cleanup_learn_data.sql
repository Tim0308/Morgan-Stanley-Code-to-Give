-- Cleanup Learn Tab Sample Data
-- This script removes all existing Learn tab data to prepare for fresh sample data

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
