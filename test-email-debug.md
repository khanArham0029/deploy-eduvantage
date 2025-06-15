# Email System Debug Guide

## 🔍 **Debugging Steps**

### 1. **Check Environment Variables**
First, verify your Mailjet credentials are properly set in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Verify these environment variables exist:
   - `MAILJET_API_KEY`
   - `MAILJET_SECRET_KEY`

### 2. **Test the Email Function Manually**
You can manually trigger the email function to see detailed logs:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-deadline-reminders \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 3. **Check Supabase Function Logs**
1. Go to Supabase Dashboard → **Edge Functions**
2. Click on `send-deadline-reminders`
3. Check the **Logs** tab for detailed output

### 4. **Verify Database Data**
Check if reminders are being created properly:

```sql
-- Check if applications exist
SELECT id, university_name, application_deadline, reminder_type, first_reminder_sent 
FROM application_deadlines 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if reminders are being created
SELECT r.*, a.university_name 
FROM deadline_reminders r
JOIN application_deadlines a ON r.application_id = a.id
ORDER BY r.created_at DESC 
LIMIT 10;

-- Check reminders scheduled for today
SELECT r.*, a.university_name, a.application_deadline
FROM deadline_reminders r
JOIN application_deadlines a ON r.application_id = a.id
WHERE r.scheduled_date = CURRENT_DATE
AND r.email_sent = false;
```

### 5. **Common Issues & Solutions**

#### **Issue 1: No Environment Variables**
- **Solution**: Add Mailjet credentials to Supabase Edge Functions settings

#### **Issue 2: No Reminders Created**
- **Solution**: Check if the trigger functions are working properly
- **Check**: Look at the database migration logs

#### **Issue 3: Mailjet Authentication Failed**
- **Solution**: Verify API keys are correct and account is active
- **Check**: Test with a simple Mailjet API call

#### **Issue 4: Email Blocked/Spam**
- **Solution**: 
  - Check spam folder
  - Verify sender domain
  - Use a verified sender email in Mailjet

#### **Issue 5: Wrong Scheduled Date**
- **Solution**: Check timezone settings and date calculations

### 6. **Manual Email Test**
You can test Mailjet directly with this curl command:

```bash
curl -X POST https://api.mailjet.com/v3.1/send \
  -H "Authorization: Basic $(echo -n 'YOUR_API_KEY:YOUR_SECRET_KEY' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "Messages": [{
      "From": {"Email": "noreply@eduvantage.com", "Name": "EduVantage"},
      "To": [{"Email": "your-email@example.com", "Name": "Test User"}],
      "Subject": "Test Email",
      "HTMLPart": "<h1>Test Email</h1><p>This is a test email from EduVantage.</p>"
    }]
  }'
```

## 🎯 **Expected Behavior**

When you add a new application deadline:

1. ✅ **Immediate Reminder**: Should be sent within minutes
2. ✅ **Future Reminders**: Should be scheduled based on your choice:
   - **Daily**: Every day until deadline
   - **Milestone**: 30, 14, 7, 3, 1 days before deadline

## 📧 **Email Details**

- **From**: noreply@eduvantage.com
- **Subject**: 📚 Application Added: [University] - [Program]
- **Content**: Professional HTML email with application details

## 🚨 **If Still Not Working**

1. Check Supabase function logs for specific error messages
2. Verify Mailjet account status and sending limits
3. Test with a different email address
4. Check if your domain needs verification in Mailjet
5. Ensure you're not hitting rate limits

The updated function now includes extensive logging to help identify exactly where the issue is occurring.