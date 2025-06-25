
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, jobId, userId } = await req.json()

    if (!text || !jobId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, jobId, userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple PDF generation using HTML to PDF conversion
    // In a real implementation, you would use pdf-lib or similar
    const pdfContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .content { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Resume for ${jobId}</h1>
        <div class="content">
          ${text.replace(/\n/g, '<br>')}
        </div>
        <footer style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          Generated on ${new Date().toLocaleDateString()}
        </footer>
      </body>
      </html>
    `

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // For now, we'll store the HTML content as a pseudo-PDF
    const fileName = `${userId}/${jobId}-${Date.now()}.html`
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, new Blob([pdfContent], { type: 'text/html' }))

    if (uploadError) {
      throw uploadError
    }

    // Insert metadata into database
    const { data: resumeData, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        job_id: jobId,
        pdf_url: fileName,
        content: text
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resume: resumeData,
        fileName: fileName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
