import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses env variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { bookingId, clientEmail, clientName, service, date, time } = await request.json();

    if (!bookingId || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log reminder action to console (email requires Resend/SendGrid setup)
    console.log(`[Remind] Sending reminder to ${clientEmail} (${clientName}) for booking ${bookingId}`);
    console.log(`[Remind] Service: ${service} on ${date} at ${time}`);

    // TODO: Add real email sending here with Resend
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Zuri <noreply@zuri.in>',
    //   to: clientEmail,
    //   subject: `Reminder: ${service} appointment tomorrow`,
    //   html: `<p>Hi ${clientName}, reminder for your ${service} on ${date} at ${time}.</p>`,
    // });

    // Store reminder log in Supabase (optional tracking)
    await supabase.from('bookings').update({
      status: 'confirmed' // Ensure status is set
    }).eq('id', bookingId);

    return NextResponse.json({
      success: true,
      message: `Reminder logged for ${clientEmail} — booking ${bookingId}`,
    });
  } catch (error) {
    console.error('Remind API error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
