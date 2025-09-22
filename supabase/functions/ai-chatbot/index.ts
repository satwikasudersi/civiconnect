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

// Fallback responses for common FAQs
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // FAQ patterns and responses
  const faqPatterns = [
    {
      keywords: ['submit', 'report', 'complaint', 'issue', 'how to'],
      response: `📝 **How to Submit a Complaint:**

1. Click on "Report Issues" in the main dashboard
2. Select your issue category (🚧 Roads, 💧 Water, 🗑️ Waste, ⚡ Electricity, etc.)
3. Provide a detailed description of the problem
4. Add your location (district/pincode)
5. Upload photos if available
6. Submit and get your tracking ID

✨ You can also use this chatbot for step-by-step guidance!`
    },
    {
      keywords: ['track', 'status', 'follow', 'check'],
      response: `📊 **How to Track Your Complaint Status:**

1. Go to "My Reports" section in the dashboard
2. Use your complaint tracking ID
3. Check status updates: Pending → In Progress → Resolved
4. Receive notifications via SMS/email for updates

🔍 Current status meanings:
• **Pending**: Complaint received, awaiting review
• **In Progress**: Authority is working on the issue  
• **Resolved**: Issue has been fixed`
    },
    {
      keywords: ['category', 'type', 'issues', 'report'],
      response: `🏢 **Issue Categories You Can Report:**

**Municipal Issues:**
• 🚧 Roads & Infrastructure (potholes, broken roads)
• 💧 Water Supply (leakage, shortage, quality)
• 🗑️ Waste Management (garbage collection, dumping)
• ⚡ Electricity (streetlights, power issues)
• 🚰 Drainage (blockages, overflow)

**Corruption Issues:**
• 💰 Bribery in government offices
• ⚖️ Misuse of public funds
• 🏛️ Abuse of power by officials

Each category is automatically routed to the relevant authority for faster resolution!`
    },
    {
      keywords: ['help', 'support', 'contact', 'authority'],
      response: `📞 **Contact Information & Support:**

**For Municipal Issues:**
• Greater Hyderabad Municipal Corporation
• Phone: 155304
• Email: commissioner-ghmc@gov.in

**For Corruption Cases:**
• Anti Corruption Bureau Telangana  
• Phone: 040-2325-1555
• Email: dg_acb@telangana.gov.in

**Emergency Situations:**
For urgent issues (water contamination, road accidents, etc.), call the respective emergency numbers immediately and then file a complaint here for follow-up.

💬 I'm here 24/7 to guide you through the reporting process!`
    },
    {
      keywords: ['anonymous', 'privacy', 'identity'],
      response: `🔒 **Privacy & Anonymous Reporting:**

• Your identity is protected throughout the process
• You can choose to file anonymous complaints
• Personal details are only shared with relevant authorities when necessary
• Your data is encrypted and secure
• You control what information to share

Anonymous reporting is especially important for corruption cases. We ensure your safety while fighting for civic improvements! 🛡️`
    }
  ];

  // Find matching FAQ
  for (const faq of faqPatterns) {
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return faq.response;
    }
  }

  // Default fallback response
  return `🤖 I'm your AI civic assistant for Telangana! I can help you with:

• 📝 **Reporting complaints** step-by-step
• 📊 **Tracking** your complaint status  
• 🏢 **Understanding** different issue categories
• 📞 **Finding** the right authorities to contact

Just ask me things like:
• "How do I submit a complaint?"
• "What types of issues can I report?"
• "How do I track my complaint status?"
• "Help me report a road problem"

What would you like to know? 😊`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, conversationId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received message:', message);

    let aiResponse: string;

    // Try OpenAI API first
    if (openAIApiKey) {
      try {
        const systemPrompt = `You are the grievance management AI assistant for the "Civic Crowdsourced Reporting System" in Telangana. Your job is to:

1. Help users report municipal issues (garbage, water supply, roads, drainage, lighting) and political corruption (bribery, misuse of power)
2. Categorize complaints based on user input
3. Collect location information (district or pincode)
4. Provide guidance on the reporting process
5. Answer questions about civic issues and government services in Telangana
6. Help users track their complaint status

Key authorities to reference:
- Municipal issues: Greater Hyderabad Municipal Corporation (155304, commissioner-ghmc@gov.in)
- Political corruption: Anti Corruption Bureau Telangana (040-2325-1555, dg_acb@telangana.gov.in)

Always be helpful, professional, and guide users through the civic reporting process. Protect user anonymity when requested. Use emojis to make responses engaging.`;

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
            max_tokens: 500,
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
        console.error('OpenAI failed, using fallback:', openAIError);
        aiResponse = getFallbackResponse(message);
      }
    } else {
      // Use fallback responses when no OpenAI key
      console.log('No OpenAI key found, using fallback responses');
      aiResponse = getFallbackResponse(message);
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
    const fallbackResponse = getFallbackResponse('help');
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      conversationId: `conv_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});