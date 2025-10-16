import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Input validation schema
const classifyRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  checkEmergency: z.boolean().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const requestBody = await req.json();
    const validationResult = classifyRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: validationResult.error.issues 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { text, checkEmergency } = validationResult.data;

    console.log('Classifying complaint text:', text);

    const systemPrompt = `You are an AI classifier for civic complaints in Telangana, India. 

Categories and subcategories:
- municipal: water, potholes, streetlights, trash, drainage, parks, construction, corpse
- corruption: bribery, misuse of power, illegal activities

Emergency indicators (HIGH priority): accident, dead body, fire, explosion, gas leak, heavy water leakage, collapsed building, electric shock, flooding, burst pipe, sewage overflow, injured, life threatening
High priority indicators (MEDIUM priority): no water supply, power outage, road blockage, bridge damage, signal not working

Analyze the text and respond with JSON:
{
  "category": "municipal" or "corruption",
  "subcategory": "specific subcategory",
  "priority": "low", "medium", or "high",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "isEmergency": boolean
}`;

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
          { role: 'user', content: `Classify this complaint: "${text}"` }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Classification API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Classification Response:', aiResponse);

    // Parse JSON response
    let classification;
    try {
      classification = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback classification
      classification = {
        category: 'municipal',
        subcategory: 'other',
        priority: 'medium',
        confidence: 0.5,
        reasoning: 'Unable to parse AI response, using fallback',
        isEmergency: false
      };
    }

    return new Response(JSON.stringify(classification), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-complaint function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Classification failed',
      category: 'municipal',
      subcategory: 'other',
      priority: 'medium',
      confidence: 0.5,
      reasoning: 'Fallback due to error'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});