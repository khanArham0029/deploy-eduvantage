/*
  # Update Deadline Reminder System

  1. Schema Changes
    - Add `reminder_type` field to application_deadlines table
    - Update deadline_reminders table structure
    - Add new reminder logic

  2. New Features
    - User can choose reminder frequency (daily or before_deadline)
    - First reminder sent immediately upon creation
    - Subsequent reminders based on chosen type
*/

-- Add reminder_type column to application_deadlines
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'application_deadlines' AND column_name = 'reminder_type'
  ) THEN
    ALTER TABLE application_deadlines 
    ADD COLUMN reminder_type text DEFAULT 'before_deadline' 
    CHECK (reminder_type IN ('daily', 'before_deadline'));
  END IF;
END $$;

-- Update deadline_reminders table to support new reminder types
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deadline_reminders_reminder_type_check'
  ) THEN
    ALTER TABLE deadline_reminders DROP CONSTRAINT deadline_reminders_reminder_type_check;
  END IF;
  
  -- Add new constraint with updated reminder types
  ALTER TABLE deadline_reminders 
  ADD CONSTRAINT deadline_reminders_reminder_type_check 
  CHECK (reminder_type IN ('immediate', 'daily', '30_days', '14_days', '7_days', '3_days', '1_day'));
END $$;

-- Add first_reminder_sent column to track immediate reminder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'application_deadlines' AND column_name = 'first_reminder_sent'
  ) THEN
    ALTER TABLE application_deadlines 
    ADD COLUMN first_reminder_sent boolean DEFAULT false;
  END IF;
END $$;

-- Update the create_deadline_reminders function
CREATE OR REPLACE FUNCTION create_deadline_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Always create an immediate reminder (sent ASAP)
  INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
  VALUES (NEW.id, 'immediate', CURRENT_DATE);
  
  -- Create additional reminders based on reminder_type
  IF NEW.reminder_type = 'daily' THEN
    -- For daily reminders, create daily reminders from today until deadline
    INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
    SELECT 
      NEW.id,
      'daily',
      generate_series(
        CURRENT_DATE + INTERVAL '1 day',
        NEW.application_deadline,
        INTERVAL '1 day'
      )::date
    WHERE generate_series(
      CURRENT_DATE + INTERVAL '1 day',
      NEW.application_deadline,
      INTERVAL '1 day'
    )::date <= NEW.application_deadline;
    
  ELSIF NEW.reminder_type = 'before_deadline' THEN
    -- Create standard milestone reminders (30, 14, 7, 3, 1 days before)
    INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
    SELECT NEW.id, reminder_type, scheduled_date
    FROM (
      VALUES 
        ('30_days', NEW.application_deadline - INTERVAL '30 days'),
        ('14_days', NEW.application_deadline - INTERVAL '14 days'),
        ('7_days', NEW.application_deadline - INTERVAL '7 days'),
        ('3_days', NEW.application_deadline - INTERVAL '3 days'),
        ('1_day', NEW.application_deadline - INTERVAL '1 day')
    ) AS reminders(reminder_type, scheduled_date)
    WHERE scheduled_date::date > CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the update_deadline_reminders function
CREATE OR REPLACE FUNCTION update_deadline_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if deadline or reminder_type actually changed
  IF OLD.application_deadline != NEW.application_deadline OR OLD.reminder_type != NEW.reminder_type THEN
    -- Delete existing unsent reminders (except immediate ones already sent)
    DELETE FROM deadline_reminders 
    WHERE application_id = NEW.id 
    AND email_sent = false 
    AND reminder_type != 'immediate';
    
    -- Create new reminders based on updated reminder_type
    IF NEW.reminder_type = 'daily' THEN
      -- For daily reminders, create daily reminders from tomorrow until deadline
      INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
      SELECT 
        NEW.id,
        'daily',
        generate_series(
          CURRENT_DATE + INTERVAL '1 day',
          NEW.application_deadline,
          INTERVAL '1 day'
        )::date
      WHERE generate_series(
        CURRENT_DATE + INTERVAL '1 day',
        NEW.application_deadline,
        INTERVAL '1 day'
      )::date <= NEW.application_deadline;
      
    ELSIF NEW.reminder_type = 'before_deadline' THEN
      -- Create standard milestone reminders
      INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
      SELECT NEW.id, reminder_type, scheduled_date
      FROM (
        VALUES 
          ('30_days', NEW.application_deadline - INTERVAL '30 days'),
          ('14_days', NEW.application_deadline - INTERVAL '14 days'),
          ('7_days', NEW.application_deadline - INTERVAL '7 days'),
          ('3_days', NEW.application_deadline - INTERVAL '3 days'),
          ('1_day', NEW.application_deadline - INTERVAL '1 day')
      ) AS reminders(reminder_type, scheduled_date)
      WHERE scheduled_date::date > CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;