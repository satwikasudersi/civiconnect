import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Input validation schema
const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.string().max(100),
  subcategory: z.string().max(100).optional(),
  location: z.string().max(300).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  userName: z.string().min(1).max(100),
  userEmail: z.string().email().max(255),
  submissionTime: z.string()
});

// HTML sanitization helper
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json();
    const validationResult = notificationSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: validationResult.error.issues 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const notificationData = validationResult.data;
    
    console.log('Processing TEST CASE notification:', notificationData);

    // Prepare the report content with sanitized data
    const reportContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #d32f2f; margin-bottom: 20px; font-size: 24px;">🚨 TEST CASE REPORT ALERT</h1>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <strong style="color: #856404;">⚠️ This is a TEST CASE submission requiring immediate attention</strong>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Report Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; width: 30%;">Title:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.title)}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Category:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.category)}</td>
            </tr>
            ${notificationData.subcategory ? `
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Subcategory:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.subcategory)}</td>
            </tr>
            ` : ''}
            <tr${!notificationData.subcategory ? ' style="background-color: #f8f9fa;"' : ''}>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Priority:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; ${
                  notificationData.priority === 'high' ? 'background-color: #ffebee; color: #c62828;' :
                  notificationData.priority === 'medium' ? 'background-color: #fff3e0; color: #ef6c00;' :
                  'background-color: #e8f5e8; color: #2e7d32;'
                }">
                  ${notificationData.priority.toUpperCase()}
                </span>
              </td>
            </tr>
            ${notificationData.location ? `
            <tr${notificationData.subcategory ? ' style="background-color: #f8f9fa;"' : ''}>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Location:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.location)}</td>
            </tr>
            ` : ''}
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Submitted by:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.userName)} (${escapeHtml(notificationData.userEmail)})</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Submission Time:</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${escapeHtml(notificationData.submissionTime)}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">Description:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
            ${escapeHtml(notificationData.description)}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #e3f2fd; border-radius: 5px;">
            <p style="margin: 0; color: #1565c0; font-weight: bold;">📋 Next Steps:</p>
            <p style="margin: 5px 0 0 0; color: #1565c0;">Please review this TEST CASE report and take appropriate action as needed.</p>
          </div>
        </div>
        
        <footer style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated notification from CivicConnect - Smart Community Reporting</p>
        </footer>
      </div>
    `;

    // Send SMS via Twilio
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
    
    const smsMessage = `🚨 TEST CASE ALERT\n\n${notificationData.title}\n\nCategory: ${notificationData.category}\nPriority: ${notificationData.priority.toUpperCase()}\nSubmitted by: ${notificationData.userName}\n\nDescription: ${notificationData.description.substring(0, 100)}...\n\nTime: ${notificationData.submissionTime}`;

    const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhone!,
        To: '+918519890805',
        Body: smsMessage,
      }),
    });

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.text();
      console.error('Twilio SMS error:', twilioError);
    } else {
      console.log('SMS sent successfully to +918519890805');
    }

    // Send Email via Resend
    const emailResponse = await resend.emails.send({
      from: 'CivicConnect <notifications@resend.dev>',
      to: ['sricharan.dhupati@gmail.com'],
      subject: `🚨 TEST CASE Alert: ${notificationData.title}`,
      html: reportContent,
    });

    if (emailResponse.error) {
      console.error('Email sending error:', emailResponse.error);
    } else {
      console.log('Email sent successfully to sricharan.dhupati@gmail.com');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'TEST CASE notifications sent successfully',
      smsStatus: twilioResponse.ok ? 'sent' : 'failed',
      emailStatus: emailResponse.error ? 'failed' : 'sent'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-test-notifications function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});