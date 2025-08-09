import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentProductId, currentProductName } = await req.json();

    if (!currentProductId || !currentProductName) {
      return new Response(
        JSON.stringify({ error: 'Current product ID and name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!HUGGINGFACE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Required environment variables not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all products except the current one
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, stock')
      .neq('id', currentProductId)
      .gt('stock', 0); // Only recommend products in stock

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from database');
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a list of available products for the AI
    const productList = products.map(p => `${p.name} (${p.description})`).join(', ');

    // Create a prompt for AI recommendations
    const prompt = `Given a customer is viewing "${currentProductName}", recommend 3 similar or complementary products from this list: ${productList}. 

Respond with ONLY the exact product names from the list, separated by commas. Choose products that:
1. Are similar in category or function
2. Would complement the current product
3. A customer might be interested in

Example response: Product Name 1, Product Name 2, Product Name 3`;

    console.log('Getting recommendations for:', currentProductName);
    console.log('Available products:', productList);

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.3,
            do_sample: true,
            top_p: 0.8,
          }
        }),
      }
    );

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, response.statusText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Hugging Face response:', result);

    // Extract the generated text
    let generatedText = '';
    if (Array.isArray(result) && result[0]?.generated_text) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    } else {
      throw new Error('Unexpected response format from Hugging Face');
    }

    // Clean up and extract product names
    const recommendedText = generatedText.replace(prompt, '').trim();
    const recommendedNames = recommendedText
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .slice(0, 3); // Limit to 3 recommendations

    console.log('AI recommended names:', recommendedNames);

    // Find matching products from our database
    const recommendations = [];
    for (const name of recommendedNames) {
      const matchingProduct = products.find(p => 
        p.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (matchingProduct && recommendations.length < 3) {
        recommendations.push(matchingProduct);
      }
    }

    // If we don't have enough matches, add some random products
    if (recommendations.length < 3) {
      const remaining = products
        .filter(p => !recommendations.find(r => r.id === p.id))
        .slice(0, 3 - recommendations.length);
      recommendations.push(...remaining);
    }

    console.log('Final recommendations:', recommendations);

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate recommendations', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});