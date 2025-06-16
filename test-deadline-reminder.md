# Testing Application Deadline Reminder System with FastAPI

## 🧪 Manual Testing Steps

### 1. **Test Your FastAPI Microservice Directly**

First, verify your FastAPI service is working correctly:

```bash
# Test your FastAPI endpoint directly
curl -X POST https://deploy-send-email.onrender.com/send-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "your-test-email@example.com",
    "recipient_name": "Test User",
    "subject": "⏰ Test Reminder - EduVantage",
    "html_body": "<h1>Test Email</h1><p>This is a test email from EduVantage deadline reminder system.</p><p>If you receive this, the FastAPI microservice is working correctly!</p>"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### 2. **Test the Supabase Edge Function**

You can manually trigger the reminder function to test the full integration:

```bash
# Replace with your actual Supabase project URL and anon key
curl -X POST "https://oxdbhmdczslqnrllcwxm.supabase.co/functions/v1/send-deadline-reminders" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 3. **Check Function Logs**

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **send-deadline-reminders**
3. Click on the **Logs** tab to see detailed execution logs
4. Look for messages about calling the FastAPI microservice

### 4. **Verify Database Setup**

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

### 5. **Test the Complete Flow**

1. **Add a new application deadline** in your app
2. **Check if immediate reminder is created**:
   ```sql
   SELECT * FROM deadline_reminders 
   WHERE reminder_type = 'immediate' 
   AND email_sent = false
   ORDER BY created_at DESC LIMIT 5;
   ```
3. **Manually trigger the reminder function** (step 2 above)
4. **Check if email was sent** and database updated:
   ```sql
   SELECT * FROM deadline_reminders 
   WHERE reminder_type = 'immediate' 
   AND email_sent = true
   ORDER BY sent_at DESC LIMIT 5;
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
- **Now powered by your FastAPI microservice!**

## 🚨 **Troubleshooting**

### Common Issues:

1. **FastAPI microservice not responding**: 
   - Check if your Render deployment is active: `https://deploy-send-email.onrender.com/send-reminder`
   - Verify Mailjet credentials in your Render environment variables
   - Check Render logs for any errors
   
2. **Function errors**: Check Supabase function logs for detailed error messages

3. **No reminders created**: Verify database triggers are working

4. **Wrong endpoint**: Make sure you're using `/send-reminder` not `/send`

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

### Test FastAPI Health:

```bash
# Check if your FastAPI service is responding
curl -X GET https://deploy-send-email.onrender.com/

# Test with your actual endpoint structure
curl -X POST https://deploy-send-email.onrender.com/send-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "test@example.com",
    "recipient_name": "Test User", 
    "subject": "Test Subject",
    "html_body": "<p>Test HTML content</p>"
  }'
```

## 🔄 **Integration Benefits**

By using your FastAPI microservice:

1. **Reliability**: Dedicated FastAPI service for email handling
2. **Scalability**: Independent scaling of email functionality  
3. **Maintainability**: Centralized email logic in FastAPI
4. **Monitoring**: Better error tracking and logging
5. **Flexibility**: Easy to update email templates and logic
6. **Type Safety**: Pydantic models ensure proper request validation

## 📝 **Key Changes Made**

1. **Updated endpoint**: Now calls `/send-reminder` instead of `/send`
2. **Correct request format**: Uses `recipient_email`, `recipient_name`, `subject`, `html_body`
3. **Proper error handling**: Checks for `success` field in FastAPI response
4. **Enhanced logging**: Better debugging information for FastAPI integration

The system now properly integrates with your FastAPI microservice at `https://deploy-send-email.onrender.com/send-reminder` using the exact request format your service expects!