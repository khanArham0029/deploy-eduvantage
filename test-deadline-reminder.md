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

### 4. **Test Email Microservice Directly**

You can test your email microservice directly:

```bash
curl -X POST https://deploy-send-email.onrender.com/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "subject": "⏰ Test Reminder - EduVantage",
    "html": "<h1>Test Email</h1><p>This is a test email from EduVantage deadline reminder system.</p><p>If you receive this, the email microservice is working correctly!</p>"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully!",
  "details": {
    "to": "your-test-email@example.com",
    "status": "accepted"
  }
}
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
- **Now powered by your email microservice!**

## 🚨 **Troubleshooting**

### Common Issues:

1. **No emails sent**: 
   - Check if your email microservice is running: `https://deploy-send-email.onrender.com/send`
   - Verify Mailjet credentials in your microservice environment
   
2. **Function errors**: Check Supabase function logs for detailed error messages

3. **No reminders created**: Verify database triggers are working

4. **Microservice errors**: Check your Render deployment logs

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

### Test Microservice Health:

```bash
# Check if microservice is responding
curl -X GET https://deploy-send-email.onrender.com/health

# Or test with a simple ping
curl -X POST https://deploy-send-email.onrender.com/send \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

## 🔄 **Integration Benefits**

By using your email microservice:

1. **Reliability**: Dedicated service for email handling
2. **Scalability**: Independent scaling of email functionality  
3. **Maintainability**: Centralized email logic
4. **Monitoring**: Better error tracking and logging
5. **Flexibility**: Easy to update email templates and logic

The system now uses your microservice at `https://deploy-send-email.onrender.com/send` for all email delivery, making it more robust and easier to manage!