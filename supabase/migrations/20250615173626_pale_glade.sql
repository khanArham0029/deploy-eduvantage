/*
  # Fix Deadline Tracker Database Issues

  1. Ensure all new columns exist with proper defaults
  2. Fix any constraint issues
  3. Update function to handle new reminder system properly
*/

-- Ensure reminder_type column exists with proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'application_deadlines' AND column_name = 'reminder_type'
  ) THEN
    ALTER TABLE application_deadlines 
    ADD COLUMN reminder_type text DEFAULT 'before_deadline';
  END IF;
END $$;

-- Ensure first_reminder_sent column exists
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

-- Drop existing constraint if it exists and recreate with proper values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'application_deadlines_reminder_type_check'
  ) THEN
    ALTER TABLE application_deadlines DROP CONSTRAINT application_deadlines_reminder_type_check;
  END IF;
END $$;

-- Add constraint for reminder_type
ALTER TABLE application_deadlines 
ADD CONSTRAINT application_deadlines_reminder_type_check 
CHECK (reminder_type IN ('daily', 'before_deadline'));

-- Update existing records to have default reminder_type if null
UPDATE application_deadlines 
SET reminder_type = 'before_deadline' 
WHERE reminder_type IS NULL;

-- Update existing records to have default first_reminder_sent if null
UPDATE application_deadlines 
SET first_reminder_sent = false 
WHERE first_reminder_sent IS NULL;

-- Make sure the columns are not null going forward
ALTER TABLE application_deadlines 
ALTER COLUMN reminder_type SET NOT NULL,
ALTER COLUMN reminder_type SET DEFAULT 'before_deadline',
ALTER COLUMN first_reminder_sent SET NOT NULL,
ALTER COLUMN first_reminder_sent SET DEFAULT false;

-- Update deadline_reminders constraint to include new reminder types
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'deadline_reminders_reminder_type_check'
  ) THEN
    ALTER TABLE deadline_reminders DROP CONSTRAINT deadline_reminders_reminder_type_check;
  END IF;
END $$;

ALTER TABLE deadline_reminders 
ADD CONSTRAINT deadline_reminders_reminder_type_check 
CHECK (reminder_type IN ('immediate', 'daily', '30_days', '14_days', '7_days', '3_days', '1_day'));

-- Recreate the create_deadline_reminders function with better error handling
CREATE OR REPLACE FUNCTION create_deadline_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Always create an immediate reminder (sent ASAP)
  INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
  VALUES (NEW.id, 'immediate', CURRENT_DATE);
  
  -- Create additional reminders based on reminder_type
  IF NEW.reminder_type = 'daily' THEN
    -- For daily reminders, create daily reminders from tomorrow until deadline
    -- Only if deadline is in the future
    IF NEW.application_deadline > CURRENT_DATE THEN
      INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
      SELECT 
        NEW.id,
        'daily',
        date_val
      FROM generate_series(
        CURRENT_DATE + INTERVAL '1 day',
        NEW.application_deadline,
        INTERVAL '1 day'
      ) AS date_val
      WHERE date_val::date <= NEW.application_deadline;
    END IF;
    
  ELSIF NEW.reminder_type = 'before_deadline' THEN
    -- Create standard milestone reminders (30, 14, 7, 3, 1 days before)
    -- Only create reminders for dates in the future
    INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
    SELECT NEW.id, reminder_type, scheduled_date::date
    FROM (
      VALUES 
        ('30_days', NEW.application_deadline - INTERVAL '30 days'),
        ('14_days', NEW.application_deadline - INTERVAL '14 days'),
        ('7_days', NEW.application_deadline - INTERVAL '7 days'),
        ('3_days', NEW.application_deadline - INTERVAL '3 days'),
        ('1_day', NEW.application_deadline - INTERVAL '1 day')
    ) AS reminders(reminder_type, scheduled_date)
    WHERE scheduled_date::date >= CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the update function with better error handling
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
      IF NEW.application_deadline > CURRENT_DATE THEN
        INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
        SELECT 
          NEW.id,
          'daily',
          date_val
        FROM generate_series(
          CURRENT_DATE + INTERVAL '1 day',
          NEW.application_deadline,
          INTERVAL '1 day'
        ) AS date_val
        WHERE date_val::date <= NEW.application_deadline;
      END IF;
      
    ELSIF NEW.reminder_type = 'before_deadline' THEN
      -- Create standard milestone reminders
      INSERT INTO deadline_reminders (application_id, reminder_type, scheduled_date)
      SELECT NEW.id, reminder_type, scheduled_date::date
      FROM (
        VALUES 
          ('30_days', NEW.application_deadline - INTERVAL '30 days'),
          ('14_days', NEW.application_deadline - INTERVAL '14 days'),
          ('7_days', NEW.application_deadline - INTERVAL '7 days'),
          ('3_days', NEW.application_deadline - INTERVAL '3 days'),
          ('1_day', NEW.application_deadline - INTERVAL '1 day')
      ) AS reminders(reminder_type, scheduled_date)
      WHERE scheduled_date::date >= CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;