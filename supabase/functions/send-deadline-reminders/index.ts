import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailData {
  to: string
  subject: string
  html: string
}

/**
 * Sends an email via Mailjet API
 * @param {Object} emailData - Contains `to`, `subject`, and `html`
 * @returns {boolean} true if successful, false otherwise
 */
async function sendEmail(emailData: EmailData): Promise<boolean> {
  const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY') ?? '';
  const MAILJET_SECRET_KEY = Deno.env.get('MAILJET_SECRET_KEY') ?? '';

  console.log('🔍 Checking Mailjet credentials...');
  console.log('API Key exists:', !!MAILJET_API_KEY);
  console.log('Secret Key exists:', !!MAILJET_SECRET_KEY);
  console.log('API Key length:', MAILJET_API_KEY.length);
  console.log('Secret Key length:', MAILJET_SECRET_KEY.length);

  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    console.error('❌ Mailjet API credentials not found in environment variables');
    console.error('Available env vars:', Object.keys(Deno.env.toObject()));
    return false;
  }

  const mailjetUrl = 'https://api.mailjet.com/v3.1/send';

  const emailPayload = {
    Messages: [
      {
        From: {
          Email: "noreply@eduvantage.com",
          Name: "EduVantage"
        },
        To: [
          {
            Email: emailData.to,
            Name: emailData.to.split('@')[0] || "Student"
          }
        ],
        Subject: emailData.subject,
        HTMLPart: emailData.html
      }
    ]
  };

  try {
    console.log(`📧 Sending email to ${emailData.to} via Mailjet...`);
    console.log('📧 Email subject:', emailData.subject);
    console.log('📧 Mailjet URL:', mailjetUrl);
    
    const authHeader = "Basic " + btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`);
    console.log('📧 Auth header created (length):', authHeader.length);
    
    const response = await fetch(mailjetUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('📧 Mailjet response status:', response.status);
    console.log('📧 Mailjet response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('📧 Mailjet response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log(`✅ Email sent successfully to ${emailData.to}`);
      return true;
    } else {
      console.error(`❌ Mailjet API error (${response.status}):`, responseData);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send email via Mailjet:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting deadline reminder function...');
    console.log('🚀 Request method:', req.method);
    console.log('🚀 Request URL:', req.url);
    
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('🔍 Supabase URL exists:', !!supabaseUrl);
    console.log('🔍 Service key exists:', !!supabaseServiceKey);
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔍 Starting deadline reminder check...')

    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Today\'s date:', today);
    
    // Find reminders that should be sent today
    console.log('🔍 Querying reminders for today...');
    const { data: reminders, error: remindersError } = await supabaseAdmin
      .from('deadline_reminders')
      .select(`
        *,
        application_deadlines (
          *,
          users (email, full_name)
        )
      `)
      .eq('scheduled_date', today)
      .eq('email_sent', false)

    if (remindersError) {
      console.error('❌ Error fetching reminders:', remindersError)
      throw remindersError
    }

    console.log(`📋 Found ${reminders?.length || 0} reminders to send today`)
    console.log('📋 Reminders data:', JSON.stringify(reminders, null, 2));

    if (!reminders || reminders.length === 0) {
      // Let's also check if there are any applications at all
      const { data: allApps, error: appsError } = await supabaseAdmin
        .from('application_deadlines')
        .select('id, university_name, application_deadline, reminder_type, first_reminder_sent')
        .limit(5);
      
      console.log('📋 Sample applications in database:', JSON.stringify(allApps, null, 2));
      
      // Check if there are any reminders at all
      const { data: allReminders, error: allRemindersError } = await supabaseAdmin
        .from('deadline_reminders')
        .select('id, reminder_type, scheduled_date, email_sent')
        .limit(10);
      
      console.log('📋 Sample reminders in database:', JSON.stringify(allReminders, null, 2));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No reminders to send today',
          count: 0,
          debug: {
            today,
            totalApplications: allApps?.length || 0,
            totalReminders: allReminders?.length || 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailsSent = 0
    const errors = []

    // Process each reminder
    for (const reminder of reminders) {
      try {
        console.log(`🔄 Processing reminder ${reminder.id}...`);
        
        const application = reminder.application_deadlines
        const user = application.users

        console.log('👤 User data:', JSON.stringify(user, null, 2));
        console.log('📝 Application data:', JSON.stringify(application, null, 2));

        if (!user?.email) {
          console.error(`❌ No email found for user in application ${application.id}`)
          errors.push(`No email for application ${application.id}`)
          continue
        }

        // Calculate days until deadline
        const deadlineDate = new Date(application.application_deadline)
        const todayDate = new Date()
        const daysUntil = Math.ceil((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`📅 Processing reminder for ${user.email}: ${daysUntil} days until deadline`)

        // Generate email content based on reminder type
        const emailData = generateReminderEmail(
          user.full_name || 'Student',
          application.university_name,
          application.program_name,
          application.application_deadline,
          daysUntil,
          reminder.reminder_type,
          application.reminder_type
        )

        console.log('📧 Generated email data:', {
          to: user.email,
          subject: emailData.subject,
          htmlLength: emailData.html.length
        });

        // Send email via Mailjet
        const emailSent = await sendEmail({
          to: user.email,
          subject: emailData.subject,
          html: emailData.html
        })

        if (emailSent) {
          console.log(`✅ Email sent successfully, updating database...`);
          
          // Mark reminder as sent
          const { error: updateError } = await supabaseAdmin
            .from('deadline_reminders')
            .update({ 
              email_sent: true, 
              sent_at: new Date().toISOString() 
            })
            .eq('id', reminder.id)

          if (updateError) {
            console.error('❌ Error updating reminder:', updateError);
            errors.push(`Failed to update reminder ${reminder.id}: ${updateError.message}`);
          }

          // Mark first reminder as sent if this is an immediate reminder
          if (reminder.reminder_type === 'immediate') {
            const { error: appUpdateError } = await supabaseAdmin
              .from('application_deadlines')
              .update({ first_reminder_sent: true })
              .eq('id', application.id)

            if (appUpdateError) {
              console.error('❌ Error updating application:', appUpdateError);
              errors.push(`Failed to update application ${application.id}: ${appUpdateError.message}`);
            }
          }

          emailsSent++
          console.log(`✅ Reminder sent to ${user.email} for ${application.university_name}`)
        } else {
          errors.push(`Failed to send email to ${user.email}`)
        }

      } catch (error) {
        console.error(`❌ Error processing reminder ${reminder.id}:`, error)
        errors.push(`Reminder ${reminder.id}: ${error.message}`)
      }
    }

    const result = {
      success: true,
      message: `Processed ${reminders.length} reminders`,
      emailsSent,
      totalReminders: reminders.length,
      errors: errors.length > 0 ? errors : undefined,
      debug: {
        today,
        processedReminders: reminders.length,
        successfulEmails: emailsSent,
        failedEmails: errors.length
      }
    };

    console.log('🎉 Function completed:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in send-deadline-reminders:', error)
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process deadline reminders',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateReminderEmail(
  userName: string,
  universityName: string,
  programName: string,
  deadline: string,
  daysUntil: number,
  reminderType: string,
  userReminderType: string
): { subject: string; html: string } {
  const deadlineFormatted = new Date(deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let urgencyColor = '#10b981' // emerald
  let urgencyText = 'upcoming'
  let reminderTypeText = ''
  
  // Set urgency based on days until deadline
  if (daysUntil <= 0) {
    urgencyColor = '#ef4444' // red
    urgencyText = 'urgent - deadline today!'
  } else if (daysUntil <= 1) {
    urgencyColor = '#ef4444' // red
    urgencyText = 'urgent'
  } else if (daysUntil <= 3) {
    urgencyColor = '#f59e0b' // amber
    urgencyText = 'important'
  } else if (daysUntil <= 7) {
    urgencyColor = '#f59e0b' // amber
    urgencyText = 'important'
  }

  // Set reminder type text
  if (reminderType === 'immediate') {
    reminderTypeText = 'Welcome! This is your first reminder for this application.'
  } else if (reminderType === 'daily') {
    reminderTypeText = `Daily reminder as requested (${userReminderType} reminders enabled)`
  } else {
    reminderTypeText = `${reminderType.replace('_', ' ')} milestone reminder`
  }

  const subject = reminderType === 'immediate' 
    ? `📚 Application Added: ${universityName} - ${programName}`
    : daysUntil <= 0
    ? `🚨 DEADLINE TODAY: ${universityName} Application`
    : daysUntil <= 1
    ? `⚠️ URGENT: ${daysUntil} day left for ${universityName} application`
    : `⏰ Reminder: ${daysUntil} days until ${universityName} application deadline`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Deadline Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
      <div style="background-color: white; width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 24px;">🎓</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">EduVantage</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">Application Deadline Reminder</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background-color: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px;">
          ${urgencyText}
        </div>
        <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">
          Hello ${userName}!
        </h2>
        <p style="color: #6b7280; margin: 0; font-size: 16px;">
          ${reminderTypeText}
        </p>
      </div>

      <!-- Application Details -->
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Application Details</h3>
        
        <div style="margin-bottom: 12px;">
          <span style="color: #6b7280; font-size: 14px; font-weight: 500;">University:</span>
          <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 4px;">${universityName}</div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Program:</span>
          <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-top: 4px;">${programName}</div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Deadline:</span>
          <div style="color: ${urgencyColor}; font-size: 16px; font-weight: 600; margin-top: 4px;">${deadlineFormatted}</div>
        </div>
        
        <div>
          <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Days Remaining:</span>
          <div style="color: ${urgencyColor}; font-size: 24px; font-weight: 700; margin-top: 4px;">
            ${daysUntil <= 0 ? 'DEADLINE TODAY!' : daysUntil}
          </div>
        </div>
      </div>

      <!-- Action Items -->
      <div style="background-color: #eff6ff; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px;">
        <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">📋 Action Items:</h4>
        <ul style="color: #059669; margin: 0; padding-left: 16px; font-size: 14px;">
          <li>Review all application requirements</li>
          <li>Complete and submit your application</li>
          <li>Upload required documents</li>
          <li>Pay application fees if applicable</li>
          <li>Submit before the deadline</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://your-app-url.com/deadlines" style="background-color: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
          View All Deadlines
        </a>
      </div>

      <!-- Reminder Settings Info -->
      ${reminderType === 'immediate' ? `
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h4 style="color: #0369a1; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">📧 Your Reminder Settings:</h4>
        <p style="color: #0369a1; margin: 0; font-size: 14px;">
          You have chosen <strong>${userReminderType === 'daily' ? 'daily reminders' : 'milestone reminders (30, 14, 7, 3, 1 days before deadline)'}</strong>. 
          You can change this anytime in your application settings.
        </p>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 12px;">
          This is an automated reminder from EduVantage. You can manage your deadline notifications in your account settings.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  return { subject, html }
}