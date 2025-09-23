import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily reminders job...");

    // Get all incomplete issues (not resolved and no completed_at)
    const { data: incompleteIssues, error: issuesError } = await supabase
      .from('issues')
      .select(`
        id,
        title,
        description,
        category,
        status,
        created_at,
        user_id,
        profiles!inner(email, display_name)
      `)
      .neq('status', 'resolved')
      .is('completed_at', null);

    if (issuesError) {
      console.error("Error fetching incomplete issues:", issuesError);
      throw issuesError;
    }

    console.log(`Found ${incompleteIssues?.length || 0} incomplete issues`);

    if (!incompleteIssues || incompleteIssues.length === 0) {
      return new Response(JSON.stringify({ message: "No incomplete issues found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send reminders for each incomplete issue
    const reminderResults = await Promise.allSettled(
      incompleteIssues.map(async (issue: any) => {
        const userEmail = issue.profiles.email;
        const userName = issue.profiles.display_name || "User";

        if (!userEmail) {
          console.log(`No email found for user ${issue.user_id}`);
          return;
        }

        // Send email reminder
        const emailResult = await resend.emails.send({
          from: "CivicConnect <noreply@resend.dev>",
          to: [userEmail],
          subject: `Reminder: Your issue "${issue.title}" is still pending`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Issue Reminder</h1>
              <p>Hello ${userName},</p>
              <p>This is a friendly reminder about your reported issue:</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #555; margin: 0 0 10px 0;">${issue.title}</h3>
                <p style="color: #666; margin: 0 0 10px 0;"><strong>Category:</strong> ${issue.category}</p>
                <p style="color: #666; margin: 0 0 10px 0;"><strong>Status:</strong> ${issue.status}</p>
                <p style="color: #666; margin: 0;">${issue.description}</p>
              </div>
              
              <p>If this issue has been resolved, please log in to CivicConnect and mark it as complete to stop receiving these reminders.</p>
              
              <p>Thank you for helping improve our community!</p>
              <p><strong>The CivicConnect Team</strong></p>
            </div>
          `,
        });

        console.log(`Email sent to ${userEmail} for issue ${issue.id}`);
        return emailResult;
      })
    );

    const successCount = reminderResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = reminderResults.filter(result => result.status === 'rejected').length;

    console.log(`Daily reminders completed: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      message: "Daily reminders sent",
      sent: successCount,
      failed: failureCount,
      total: incompleteIssues.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in daily reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);