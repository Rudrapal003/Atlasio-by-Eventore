// Supabase Edge Function: twilio-sms
// Sends SMS notifications to vendors for new bookings/leads
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

serve(async (req) => {
  try {
    const { toPhoneNumber, message } = await req.json()

    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const body = new URLSearchParams({
      To: toPhoneNumber,
      From: twilioPhoneNumber,
      Body: message,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
      },
      body: body.toString(),
    })

    const data = await response.json()
    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
