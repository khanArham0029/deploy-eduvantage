# Testing Application Deadline Reminder System

## 🧪 Manual Testing Steps

### 1. **Test the Edge Function Directly**

You can manually trigger the reminder function to test it:

```bash
# Replace with your actual Supabase project URL and anon key
curl -X POST "https://oxdbhmdczslqnrllcwxm.supabase.co/functions/v1/send-deadline-reminders" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 2. **Check Function Logs**

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **send-deadline-reminders**
3. Click on the **Logs** tab to see detailed execution logs

### 3. **Verify Database Setup**

Run these queries in your Supabase SQL Editor to check the data:

```sql
-- Check if applications exist
SELECT 
  id, 
  university_name, 
  program_name,
  application_deadline, 
  reminder_type, 
  first_reminder_sent,
  created_at
FROM application_deadlines 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if reminders are being created
SELECT 
  r.id,
  r.reminder_type,
  r.scheduled_date,
  r.email_sent,
  r.sent_at,
  a.university_name,
  a.program_name
FROM deadline_reminders r
JOIN application_deadlines a ON r.application_id = a.id
ORDER BY r.created_at DESC 
LIMIT 10;

-- Check reminders scheduled for today
SELECT 
  r.*,
  a.university_name,
  a.program_name,
  a.application_deadline,
  u.email,
  u.full_name
FROM deadline_reminders r
JOIN application_deadlines a ON r.application_id = a.id
JOIN users u ON a.user_id = u.id
WHERE r.scheduled_date = CURRENT_DATE
AND r.email_sent = false;
```

### 4. **Set Up Environment Variables**

Make sure these are configured in your Supabase Edge Functions settings:

1. Go to **Settings** → **Edge Functions** in Supabase Dashboard
2. Add these environment variables:
   - `MAILJET_API_KEY` - Your Mailjet API key
   - `MAILJET_SECRET_KEY` - Your Mailjet secret key

### 5. **Test Email Functionality**

You can test Mailjet directly:

```bash
# Replace with your actual Mailjet credentials
curl -X POST https://api.mailjet.com/v3.1/send \
  -H "Authorization: Basic $(echo -n 'YOUR_API_KEY:YOUR_SECRET_KEY' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "Messages": [{
      "From": {"Email": "noreply@eduvantage.com", "Name": "EduVantage"},
      "To": [{"Email": "your-test-email@example.com", "Name": "Test User"}],
      "Subject": "Test Email from EduVantage",
      "HTMLPart": "<h1>Test Email</h1><p>This is a test email from EduVantage deadline reminder system.</p>"
    }]
  }'
```

## 🔧 **Setting Up Automated Reminders**

### Option 1: Supabase Cron Jobs (Recommended)

Add this to your Supabase SQL Editor to set up daily automated execution:

```sql
-- Enable the pg_cron extension (if not already enabled)
-- This needs to be run by a superuser, contact Supabase support if needed
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run daily at 9:00 AM UTC
-- SELECT cron.schedule(
--   'send-deadline-reminders',
--   '0 9 * * *',
--   'SELECT net.http_post(
--     url := ''https://oxdbhmdczslqnrllcwxm.supabase.co/functions/v1/send-deadline-reminders'',
--     headers := ''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}''::jsonb
--   );'
-- );
```

### Option 2: External Cron Service

Use services like:
- **Cron-job.org** (free)
- **EasyCron** 
- **GitHub Actions** (with scheduled workflows)

Set them to call your edge function daily:
```
POST https://oxdbhmdczslqnrllcwxm.supabase.co/functions/v1/send-deadline-reminders
Authorization: Bearer YOUR_ANON_KEY
```

## 🎯 **Expected Behavior**

When you add a new application deadline:

1. ✅ **Immediate Reminder**: Sent within minutes of creation
2. ✅ **Scheduled Reminders**: Created based on your choice:
   - **Daily**: Every day from tomorrow until deadline
   - **Milestone**: 30, 14, 7, 3, 1 days before deadline

## 📧 **Email Template Features**

- Professional HTML design
- Responsive layout
- Urgency indicators (colors change based on days remaining)
- Action items checklist
- Personalized content
- Reminder type explanation

## 🚨 **Troubleshooting**

### Common Issues:

1. **No emails sent**: Check Mailjet credentials and account status
2. **Function errors**: Check Supabase function logs
3. **No reminders created**: Verify database triggers are working
4. **Wrong dates**: Check timezone settings

### Debug Commands:

```sql
-- Check if triggers are working
SELECT * FROM information_schema.triggers 
WHERE event_object_table IN ('application_deadlines', 'deadline_reminders');

-- Check function definitions
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name LIKE '%deadline%';
```

The system is now properly configured and should automatically send reminder emails based on your application deadlines!