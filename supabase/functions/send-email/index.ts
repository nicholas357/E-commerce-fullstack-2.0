// Follow these steps to deploy this Edge Function:
// 1. Run `supabase functions deploy send-email`
// 2. Set up SMTP credentials as secrets:
//    `supabase secrets set SMTP_HOST=your-smtp-host`
//    `supabase secrets set SMTP_PORT=your-smtp-port`
//    `supabase secrets set SMTP_USER=your-smtp-username`
//    `supabase secrets set SMTP_PASS=your-smtp-password`
//    `supabase secrets set SMTP_FROM=your-from-email`

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to, subject, content } = await req.json()

    if (!to || !subject || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get SMTP credentials from environment variables
    const SMTP_HOST = Deno.env.get("SMTP_HOST")
    const SMTP_PORT = Deno.env.get("SMTP_PORT")
    const SMTP_USER = Deno.env.get("SMTP_USER")
    const SMTP_PASS = Deno.env.get("SMTP_PASS")
    const SMTP_FROM = Deno.env.get("SMTP_FROM")

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      return new Response(JSON.stringify({ error: "SMTP configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Configure SMTP client
    const client = new SmtpClient()
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: Number.parseInt(SMTP_PORT),
      username: SMTP_USER,
      password: SMTP_PASS,
    })

    // Send email
    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      content: content,
      html: content,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
