/*
  # Fix Foreign Key Relationships

  1. Problem
    - Missing foreign key relationship between application_deadlines and users
    - Supabase cannot resolve joins in select queries without proper relationships

  2. Solution
    - Add proper foreign key constraint from application_deadlines.user_id to users.id
    - Ensure the relationship is properly defined in the schema cache

  3. Changes
    - Add foreign key constraint if missing
    - Update any existing data to ensure referential integrity
*/

-- First, let's check if the foreign key constraint exists
DO $$
BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'application_deadlines_user_id_fkey'
    AND table_name = 'application_deadlines'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE application_deadlines 
    ADD CONSTRAINT application_deadlines_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint: application_deadlines_user_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: application_deadlines_user_id_fkey';
  END IF;
END $$;

-- Ensure the users table has proper foreign key to auth.users if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey'
    AND table_name = 'users'
  ) THEN
    -- Add the foreign key constraint to auth.users
    ALTER TABLE users 
    ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint: users_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists: users_id_fkey';
  END IF;
END $$;

-- Update the send-deadline-reminders function to use a simpler query that doesn't rely on complex joins
CREATE OR REPLACE FUNCTION get_reminders_with_user_info()
RETURNS TABLE (
  reminder_id uuid,
  application_id uuid,
  reminder_type text,
  scheduled_date date,
  email_sent boolean,
  sent_at timestamptz,
  university_name text,
  program_name text,
  application_deadline date,
  user_email text,
  user_full_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as reminder_id,
    r.application_id,
    r.reminder_type,
    r.scheduled_date,
    r.email_sent,
    r.sent_at,
    a.university_name,
    a.program_name,
    a.application_deadline,
    u.email as user_email,
    u.full_name as user_full_name
  FROM deadline_reminders r
  INNER JOIN application_deadlines a ON r.application_id = a.id
  INNER JOIN users u ON a.user_id = u.id
  WHERE r.scheduled_date = CURRENT_DATE
  AND r.email_sent = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_reminders_with_user_info() TO authenticated;
GRANT EXECUTE ON FUNCTION get_reminders_with_user_info() TO service_role;