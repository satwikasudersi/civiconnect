import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Helper function to get user's complaint data
const getUserComplaintData = async (supabase: any, userId: string) => {
  try {
    // Get user's issues
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (issuesError) {
      console.error('Error fetching user issues:', issuesError);
      return { issues: [], suggestions: [], totalIssues: 0 };
    }

    // Get user's suggestions
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      issues: issues || [],
      suggestions: suggestions || [],
      totalIssues: issues?.length || 0,
      recentIssue: issues?.[0] || null,
      pendingIssues: issues?.filter(i => i.status === 'reported').length || 0,
      resolvedIssues: issues?.filter(i => i.status === 'resolved').length || 0
    };
  } catch (error) {
    console.error('Error in getUserComplaintData:', error);
    return { issues: [], suggestions: [], totalIssues: 0 };
  }
};

// Enhanced context-aware response function
const getContextualResponse = async (message: string, userData: any, supabase: any, userId?: string): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  
  // Check if user is asking about their specific complaints
  if ((lowerMessage.includes('my') || lowerMessage.includes('track') || lowerMessage.includes('status')) && userId) {
    const userComplaintData = await getUserComplaintData(supabase, userId);
    
    if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
      if (userComplaintData.totalIssues === 0) {
        return `📊 **Your Complaint Status:**

You haven't submitted any complaints yet. Would you like me to help you report an issue?

🚀 **Quick Start:**
• Click "Report Issues" in the dashboard
• I can guide you step-by-step through the process
• Get a tracking ID to monitor progress

What issue would you like to report? 🤔`;
      }

      let statusResponse = `📊 **Your Complaint Status Dashboard:**\n\n`;
      statusResponse += `📈 **Overview:**\n`;
      statusResponse += `• Total Complaints: ${userComplaintData.totalIssues}\n`;
      statusResponse += `• ⏳ Pending: ${userComplaintData.pendingIssues}\n`;
      statusResponse += `• ✅ Resolved: ${userComplaintData.resolvedIssues}\n\n`;

      if (userComplaintData.recentIssue) {
        statusResponse += `🔍 **Most Recent Complaint:**\n`;
        statusResponse += `• **Title:** ${userComplaintData.recentIssue.title}\n`;
        statusResponse += `• **Category:** ${userComplaintData.recentIssue.category}\n`;
        statusResponse += `• **Status:** ${userComplaintData.recentIssue.status}\n`;
        statusResponse += `• **Priority:** ${userComplaintData.recentIssue.priority}\n`;
        statusResponse += `• **Submitted:** ${new Date(userComplaintData.recentIssue.created_at).toLocaleDateString()}\n\n`;
      }

      statusResponse += `💡 **Next Steps:**\n`;
      if (userComplaintData.pendingIssues > 0) {
        statusResponse += `• Your pending complaints are being reviewed by authorities\n`;
        statusResponse += `• You'll receive SMS/email updates on progress\n`;
        statusResponse += `• Typical resolution time: 3-7 business days\n`;
      }
      statusResponse += `• Need help with a new issue? I'm here to guide you! 😊`;

      return statusResponse;
    }

    if (lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      if (userComplaintData.totalIssues > 0) {
        return `📋 **Your Complaint History:**

You have ${userComplaintData.totalIssues} complaint(s) on record:
${userComplaintData.issues.slice(0, 3).map((issue: any, index: number) => 
  `${index + 1}. **${issue.title}** (${issue.category}) - Status: ${issue.status}`
).join('\n')}

${userComplaintData.totalIssues > 3 ? `\n...and ${userComplaintData.totalIssues - 3} more. Check "My Reports" for full details.\n` : ''}

🤔 **Need Help With:**
• Updating an existing complaint?
• Checking specific status details?
• Reporting a new issue?

Just let me know! 💬`;
      }
    }
  }

  // Original FAQ patterns with enhanced responses
  return getFallbackResponse(message);
};

// Enhanced FAQ patterns with more specific responses
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // FAQ patterns and responses
  const faqPatterns = [
    {
      keywords: ['submit', 'report', 'complaint', 'issue', 'how to', 'file'],
      response: `📝 **How to Submit a Complaint - Step by Step:**

**📱 Quick Method:**
1. Click "Report Issues" in the main dashboard
2. Select category: 🚧 Roads, 💧 Water, 🗑️ Waste, ⚡ Electricity, 🚰 Drainage
3. Describe the problem clearly
4. Add location (district/pincode/landmark)
5. Upload photos (helps get faster resolution!)
6. Submit and get your tracking ID

**💬 AI-Assisted Method:**
• Type "report an issue" here for step-by-step guidance
• I'll help categorize and prioritize your complaint
• Get tips for writing effective descriptions

**⚡ Pro Tips:**
• Include specific location details
• Mention safety concerns for higher priority
• Add multiple photos from different angles

Ready to start? Click "Report Issue" above! 🚀`
    },
    {
      keywords: ['track', 'status', 'follow', 'check', 'my complaint', 'progress'],
      response: `📊 **How to Track Your Complaint Status:**

**📲 Multiple Ways to Track:**
1. **Dashboard**: Go to "My Reports" section
2. **Chatbot**: Ask me "track my complaints" or "my status"
3. **SMS/Email**: Automatic updates sent to you
4. **Tracking ID**: Use it on the status page

**📈 Status Meanings:**
• 🔄 **Pending**: Complaint received, being reviewed
• ⚙️ **In Progress**: Authority is actively working on it
• ✅ **Resolved**: Issue has been fixed/addressed
• ❌ **Rejected**: Not within scope (rare, with explanation)

**⏰ Typical Timeline:**
• Municipal issues: 3-7 business days
• Corruption cases: 7-15 business days
• Emergency issues: Same day response

**🔔 Get Notified:**
• Status changes trigger automatic SMS/email
• Critical updates sent immediately
• Weekly summary for pending issues

Try asking me "track my complaints" to see your personalized status! 📱`
    },
    {
      keywords: ['edit', 'update', 'change', 'modify', 'delete', 'remove'],
      response: `✏️ **Managing Your Complaints:**

**📝 Editing Complaints:**
• Go to "My Reports" section
• Click on any complaint to view details
• Use "Edit" button to modify description, add photos
• Cannot change category after submission (prevents misuse)

**🗑️ Deleting Complaints:**
• Only possible within 24 hours of submission
• Click "Delete" in complaint details
• Permanent action - cannot be undone
• Alternative: Add clarification instead of deleting

**🔄 Adding Updates:**
• Use "Add Update" to provide new information
• Upload additional photos or evidence
• Clarify location or severity
• These updates help authorities resolve faster

**⚠️ Important Notes:**
• Fraudulent complaints may lead to account suspension
• Major changes require creating a new complaint
• Authority responses cannot be edited (but you can reply)

**💡 Best Practice:**
Instead of deleting, add updates with corrections! This maintains the complete history for authorities. 📚`
    },
    {
      keywords: ['authority', 'contact', 'phone', 'email', 'office', 'help', 'support'],
      response: `📞 **Contact Information & Authorities:**

**🏛️ Municipal Issues:**
• **GHMC**: 155304 | commissioner-ghmc@gov.in
• **Water Board**: 155313 | customercare@hyderabadwater.gov.in
• **Electricity**: 1912 | complaint@tssouthernpower.com
• **Traffic**: 9010203626 | traffic.hyd@tspolice.gov.in

**🔒 Corruption Cases:**
• **ACB Telangana**: 040-2325-1555 | dg_acb@telangana.gov.in
• **Vigilance**: 040-2346-1151 | vigilance@telangana.gov.in
• **Lokayukta**: 040-2332-4621 | info@tslokayukta.gov.in

**🚨 Emergency Contacts:**
• Fire: 101 | Ambulance: 108 | Police: 100
• Disaster: 040-2345-3456 | Women Helpline: 181

**💬 Platform Support:**
• Technical issues: Use this chatbot
• Account problems: Ask me "account help"
• Report bugs: Describe the issue here

**⚡ Quick Response Tips:**
• For urgent issues: Call first, then file complaint
• Use WhatsApp numbers for faster response
• Mention complaint ID when calling authorities

Need help with something specific? Just ask! 🤝`
    },
    {
      keywords: ['category', 'type', 'issues', 'what can report', 'kind'],
      response: `🏢 **Complete Issue Categories & Examples:**

**🏙️ Municipal Services:**
• 🚧 **Roads**: Potholes, broken footpaths, traffic signals
• 💧 **Water**: Leakage, shortage, contamination, billing
• 🗑️ **Waste**: Garbage collection, illegal dumping, overflowing bins
• ⚡ **Electricity**: Streetlight issues, power cuts, billing disputes
• 🚰 **Drainage**: Blockages, overflow, manholes, stagnant water
• 🌳 **Parks**: Maintenance, encroachment, damaged equipment

**💰 Corruption & Governance:**
• 🤝 Bribery in government offices
• 📄 Document processing delays/demands
• ⚖️ Misuse of public funds
• 🏛️ Abuse of power by officials
• 🎯 Favoritism in public services

**🚨 Safety & Security:**
• 🔒 Street safety, lighting issues
• 🚦 Traffic violations, illegal parking
• 🏗️ Unauthorized construction
• 🎵 Noise pollution, illegal events

**✅ What Gets Resolved Fastest:**
• Issues with photos/evidence
• Clear location details
• Safety-related problems
• Multiple citizen reports on same issue

**❌ What We Cannot Handle:**
• Private disputes between individuals
• Court cases or legal matters
• Central government issues

Each category automatically routes to the right authority! 🎯`
    },
    {
      keywords: ['anonymous', 'privacy', 'identity', 'confidential', 'secret'],
      response: `🔒 **Privacy & Anonymous Reporting:**

**🛡️ Your Privacy is Protected:**
• End-to-end encryption for all data
• Identity shared only with relevant authorities when needed
• Option to file completely anonymous complaints
• IP address and device info not stored with complaints

**👤 Anonymous Reporting Options:**
• Check "Anonymous" during complaint submission
• Use generic email for account (not required to be real name)
• Phone number optional for anonymous reports
• No personal details shared in public complaint tracking

**🔐 Data Security Measures:**
• All personal data encrypted at rest
• Secure transmission protocols (HTTPS/TLS)
• Authority access logged and audited
• Automatic data deletion after case closure

**⚠️ When Identity May Be Needed:**
• Corruption cases requiring witness testimony
• Legal proceedings initiated by authorities
• Follow-up investigations requiring clarification
• Court orders (rare, with legal notice)

**💡 Best Practices for Anonymity:**
• Use general location descriptions
• Avoid mentioning personal relationships
• Focus on facts, not opinions
• Use separate email for sensitive reports

**🚨 Special Protection for Whistleblowers:**
• Extra security for corruption reports
• Direct channels to senior authorities
• Legal protection under Whistleblower Act
• 24/7 support for serious cases

Your safety comes first! 🛡️`
    }
  ];

  // Enhanced pattern matching
  for (const faq of faqPatterns) {
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return faq.response;
    }
  }

  // More specific default responses based on context
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return `🤖 **How I Can Help You:**

**🎯 Main Functions:**
• 📝 Guide you through complaint submission
• 📊 Track your complaint status in real-time
• 🏢 Explain issue categories and authorities
• 📞 Provide contact information and escalation paths
• 💡 Give tips for effective complaint writing

**💬 Try These Commands:**
• "Track my complaints" - See your personalized status
• "Report an issue" - Step-by-step guidance
• "Contact info for water problems" - Get specific authority details
• "How to write effective complaints" - Pro tips
• "My complaint history" - View all your submissions

**🚀 Quick Actions:**
• Click "Report Issue" above for guided submission
• Ask specific questions about your area of concern
• Request escalation help for unresolved issues

**📱 Available 24/7:**
I'm here anytime you need help with civic issues in Telangana! What would you like assistance with? 😊`;
  }

  // Default comprehensive response
  return `🤖 **Welcome to Your AI Civic Assistant!**

**🎯 I'm specialized in helping with:**
• 📝 **Complaint Reporting**: Step-by-step guidance for all issue types
• 📊 **Status Tracking**: Real-time updates on your submissions
• 🏢 **Authority Information**: Know exactly who handles what
• 💬 **Process Guidance**: Navigate civic services efficiently
• 🔍 **Personal Dashboard**: Track your complaint history

**🚀 Quick Start Options:**
• Type "report an issue" for guided submission
• Ask "track my complaints" for personalized status
• Say "help with [specific issue]" for targeted assistance
• Click "Report Issue" button above for immediate help

**💡 Popular Queries:**
• "How to report a pothole?"
• "Water supply complaint procedure"
• "Track complaint status"
• "Corruption reporting process"
• "Contact information for authorities"

**🌟 Pro Tips:**
• Be specific about locations
• Include photos when possible
• Use this chat for real-time guidance
• Check your email/SMS for status updates

Ready to make your city better? What issue would you like to address today? 🏙️✨`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationId, userId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received message:', message, 'User ID:', userId);

    // Get user data if userId is provided
    let userData = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      userData = profile;
    }

    let aiResponse: string;

    // Try OpenAI API first
    if (openAIApiKey) {
      try {
        // Get contextual information for better AI responses
        let contextualInfo = '';
        if (userId) {
          const userComplaintData = await getUserComplaintData(supabase, userId);
          contextualInfo = `\n\nUser Context:
- Total complaints submitted: ${userComplaintData.totalIssues}
- Pending complaints: ${userComplaintData.pendingIssues}
- Resolved complaints: ${userComplaintData.resolvedIssues}
- Most recent complaint: ${userComplaintData.recentIssue ? `"${userComplaintData.recentIssue.title}" (${userComplaintData.recentIssue.status})` : 'None'}`;
        }

        const systemPrompt = `You are the grievance management AI assistant for the "Civic Crowdsourced Reporting System" in Telangana. Your job is to:

1. Help users report municipal issues (garbage, water supply, roads, drainage, lighting) and political corruption (bribery, misuse of power)
2. Categorize complaints based on user input
3. Collect location information (district or pincode)
4. Provide guidance on the reporting process
5. Answer questions about civic issues and government services in Telangana
6. Help users track their complaint status with personalized information
7. Provide specific status updates and actionable next steps

Key authorities to reference:
- Municipal issues: Greater Hyderabad Municipal Corporation (155304, commissioner-ghmc@gov.in)
- Political corruption: Anti Corruption Bureau Telangana (040-2325-1555, dg_acb@telangana.gov.in)

Always be helpful, professional, and guide users through the civic reporting process. Protect user anonymity when requested. Use emojis to make responses engaging. Be specific and actionable in your advice.${contextualInfo}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 600,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        aiResponse = data.choices[0].message.content;

        console.log('AI Response:', aiResponse);
      } catch (openAIError) {
        console.error('OpenAI failed, using contextual fallback:', openAIError);
        aiResponse = await getContextualResponse(message, userData, supabase, userId);
      }
    } else {
      // Use contextual fallback responses when no OpenAI key
      console.log('No OpenAI key found, using contextual fallback responses');
      aiResponse = await getContextualResponse(message, userData, supabase, userId);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: conversationId || `conv_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chatbot function:', error);
    
    // Always provide a meaningful fallback response
    const fallbackResponse = await getContextualResponse('help', null, null, null);
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      conversationId: `conv_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});