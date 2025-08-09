
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { productName, features } = await req.json();
    console.log('Request received:', { productName, features });

    if (!productName) {
      console.log('Error: Product name is required');
      return new Response(
        JSON.stringify({ error: 'Product name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HUGGINGFACE_API_KEY) {
      console.log('Error: Hugging Face API key not configured');
      return new Response(
        JSON.stringify({ error: 'Hugging Face API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a more detailed prompt
    const featuresText = features ? ` with features: ${features}` : '';
    const prompt = `Write a compelling, engaging product description for a ${productName}${featuresText}. Make it persuasive and highlight the key benefits. Keep it concise but impactful.`;

    console.log('Generating description for:', productName);
    console.log('Using prompt:', prompt);

    // Try the more reliable model first
    let response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    console.log('Hugging Face API response status:', response.status);

    if (!response.ok) {
      console.log('First model failed, trying alternative...');
      // Try alternative model
      response = await fetch(
        'https://api-inference.huggingface.co/models/gpt2',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 150,
              temperature: 0.8,
              do_sample: true,
              pad_token_id: 50256
            }
          }),
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, response.statusText, errorText);
      
      // Return a fallback description if API fails
      const fallbackDescription = `Discover the exceptional ${productName}${features ? ` featuring ${features}` : ''}. This premium product combines quality, performance, and value to exceed your expectations. Experience the difference that makes ${productName} the perfect choice for your needs.`;
      
      console.log('Using fallback description due to API error');
      return new Response(
        JSON.stringify({ description: fallbackDescription }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
      console.log('Unexpected response format, using fallback');
      const fallbackDescription = `Discover the exceptional ${productName}${features ? ` featuring ${features}` : ''}. This premium product combines quality, performance, and value to exceed your expectations.`;
      return new Response(
        JSON.stringify({ description: fallbackDescription }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean up the generated text by removing the original prompt and trimming
    let description = generatedText.replace(prompt, '').trim();
    
    // If description is too short or empty, use fallback
    if (description.length < 20) {
      description = `Experience the premium ${productName}${features ? ` with ${features}` : ''}. Designed for excellence and built to last, this product delivers outstanding performance and reliability you can trust.`;
    }

    // Ensure description doesn't exceed reasonable length
    if (description.length > 500) {
      description = description.substring(0, 500).trim() + '...';
    }

    console.log('Final description:', description);

    return new Response(
      JSON.stringify({ description }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating description:', error);
    
    // Provide a fallback description even on error
    const { productName, features } = await req.json().catch(() => ({ productName: 'Product', features: '' }));
    const fallbackDescription = `Discover the premium ${productName || 'Product'}${features ? ` featuring ${features}` : ''}. This exceptional product is designed to meet your highest expectations with superior quality and performance.`;
    
    return new Response(
      JSON.stringify({ 
        description: fallbackDescription,
        note: 'Generated using fallback due to API issues'
      }),
      { 
        status: 200, // Return 200 with fallback instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
