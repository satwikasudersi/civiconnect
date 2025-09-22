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

Always be helpful, professional, and guide users through the civic reporting process. Protect user anonymity when requested.`;

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
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationId: conversationId || `conv_${Date.now()}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      response: 'I apologize, but I am currently experiencing technical difficulties. Please try again in a moment or proceed to report your issue directly through the form.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});