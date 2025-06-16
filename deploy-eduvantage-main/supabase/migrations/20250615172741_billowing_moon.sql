/*
  # Fix RLS policies for application_deadlines table

  1. Security Changes
    - Drop existing problematic RLS policies on application_deadlines table
    - Recreate proper RLS policies that avoid set-returning functions in WHERE clauses
    - Ensure policies use auth.uid() correctly without causing set-returning function errors

  2. Policy Updates
    - Users can read their own deadlines
    - Users can insert their own deadlines  
    - Users can update their own deadlines
    - Users can delete their own deadlines
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can read own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can insert own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can update own deadlines" ON application_deadlines;
DROP POLICY IF EXISTS "Users can delete own deadlines" ON application_deadlines;

-- Recreate policies with proper structure
CREATE POLICY "Users can read own deadlines"
  ON application_deadlines
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deadlines"
  ON application_deadlines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deadlines"
  ON application_deadlines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deadlines"
  ON application_deadlines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);