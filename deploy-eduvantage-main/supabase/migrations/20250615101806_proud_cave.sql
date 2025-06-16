/*
  # Application Deadline Tracker

  1. New Tables
    - `application_deadlines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `university_name` (text)
      - `program_name` (text)
      - `application_deadline` (date)
      - `status` (text: 'pending', 'submitted', 'accepted', 'rejected')
      - `priority` (text: 'high', 'medium', 'low')
      - `notes` (text)
      - `reminder_sent` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `deadline_reminders`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to application_deadlines)
      - `reminder_type` (text: '30_days', '14_days', '7_days', '3_days', '1_day')
      - `scheduled_date` (date)
      - `sent_at` (timestamp)
      - `email_sent` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - Trigger to automatically create reminders when deadline is added
    - Function to update reminder schedules when deadline changes
*/

-- Create application_deadlines table
CREATE TABLE IF NOT EXISTS application_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  university_name text NOT NULL,
  program_name text NOT NULL,
  application_deadline date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'accepted', 'rejected')),
  priority text DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes text DEFAULT '',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deadline_reminders table
CREATE TABLE IF NOT EXISTS deadline_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES application_deadlines(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('30_days', '14_days', '7_days', '3_days', '1_day')),
  scheduled_date date NOT NULL,
  sent_at timestamptz,
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE application_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for application_deadlines
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

-- Policies for deadline_reminders
CREATE POLICY "Users can read own reminders"
  ON deadline_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM application_deadlines 
      WHERE application_deadlines.id = deadline_reminders.application_id 
      AND application_deadlines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reminders"
  ON deadline_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM application_deadlines 
      WHERE application_deadlines.id = deadline_reminders.application_id 
      AND application_deadlines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reminders"
  ON deadline_reminders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM application_deadlines 
      WHERE application_deadlines.id = deadline_reminders.application_id 
      AND application_deadlines.user_id = auth.uid()
    )
  );

-- Function to create reminders automatically
CREATE OR REPLACE FUNCTION create_deadline_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create reminders for 30, 14, 7, 3, and 1 days before deadline
  INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
  VALUES 
    (NEW.id, '30_days', NEW.application_deadline - INTERVAL '30 days'),
    (NEW.id, '14_days', NEW.application_deadline - INTERVAL '14 days'),
    (NEW.id, '7_days', NEW.application_deadline - INTERVAL '7 days'),
    (NEW.id, '3_days', NEW.application_deadline - INTERVAL '3 days'),
    (NEW.id, '1_day', NEW.application_deadline - INTERVAL '1 day');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update reminders when deadline changes
CREATE OR REPLACE FUNCTION update_deadline_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if deadline actually changed
  IF OLD.application_deadline != NEW.application_deadline THEN
    -- Delete existing unsent reminders
    DELETE FROM deadline_reminders 
    WHERE application_id = NEW.id AND email_sent = false;
    
    -- Create new reminders
    INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
    VALUES 
      (NEW.id, '30_days', NEW.application_deadline - INTERVAL '30 days'),
      (NEW.id, '14_days', NEW.application_deadline - INTERVAL '14 days'),
      (NEW.id, '7_days', NEW.application_deadline - INTERVAL '7 days'),
      (NEW.id, '3_days', NEW.application_deadline - INTERVAL '3 days'),
      (NEW.id, '1_day', NEW.application_deadline - INTERVAL '1 day');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER create_reminders_trigger
  AFTER INSERT ON application_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION create_deadline_reminders();

CREATE TRIGGER update_reminders_trigger
  AFTER UPDATE ON application_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_deadline_reminders();

CREATE TRIGGER update_deadlines_updated_at
  BEFORE UPDATE ON application_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_deadlines_user_id ON application_deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_deadline ON application_deadlines(application_deadline);
CREATE INDEX IF NOT EXISTS idx_application_deadlines_status ON application_deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_scheduled_date ON deadline_reminders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deadline_reminders_email_sent ON deadline_reminders(email_sent);