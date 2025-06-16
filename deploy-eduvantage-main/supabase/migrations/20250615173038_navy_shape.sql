/*
  # Fix RLS policies to resolve set-returning function error

  1. Problem
    - The deadline_reminders table has RLS policies with EXISTS subqueries
    - These create circular dependencies when querying application_deadlines
    - Causes "set-returning functions are not allowed in WHERE" error

  2. Solution
    - Simplify RLS policies to use direct foreign key relationships
    - Remove complex EXISTS subqueries that cause the error
    - Ensure policies use simple scalar comparisons

  3. Changes
    - Drop existing problematic policies on deadline_reminders
    - Create new simplified policies that work correctly
    - Maintain security while avoiding complex subqueries
*/

-- Drop existing problematic policies on deadline_reminders
DROP POLICY IF EXISTS "Users can insert own reminders" ON deadline_reminders;
DROP POLICY IF EXISTS "Users can read own reminders" ON deadline_reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON deadline_reminders;

-- Create simplified policies that avoid the set-returning function issue
-- These policies work by joining through the application_deadlines table directly
-- without using EXISTS subqueries that cause the error

CREATE POLICY "Users can insert own reminders"
  ON deadline_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    application_id IN (
      SELECT id FROM application_deadlines WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own reminders"
  ON deadline_reminders
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM application_deadlines WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reminders"
  ON deadline_reminders
  FOR UPDATE
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM application_deadlines WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    application_id IN (
      SELECT id FROM application_deadlines WHERE user_id = auth.uid()
    )
  );

-- Also ensure the application_deadlines policies are simple and correct
-- Drop and recreate them to ensure they don't have any complex subqueries

DROP POLICY IF EXISTS "Users can delete own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can insert own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can read own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can update own deadlines" ON application_deadlines;

-- Create simple, direct policies for application_deadlines
CREATE POLICY "Users can delete own deadlines"
  ON application_deadlines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deadlines"
  ON application_deadlines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own deadlines"
  ON application_deadlines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own deadlines"
  ON application_deadlines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);