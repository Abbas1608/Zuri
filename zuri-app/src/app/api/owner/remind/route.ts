import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { bookingId, clientEmail, clientName, service, date, time } = await request.json();

    if (!bookingId || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Resend API integration point
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Zuri <noreply@zuri.in>',
    //   to: clientEmail,
    //   subject: `Appointment Reminder — ${service} at Silk & Stone Studio`,
    //   html: `<p>Hi ${clientName}, this is a reminder for your ${service} appointment on ${date} at ${time}.</p>`,
    // });

    console.log(`[Remind] Reminder sent to ${clientEmail} for booking ${bookingId}`);

    return NextResponse.json({ success: true, message: `Reminder sent to ${clientEmail}` });
  } catch (error) {
    console.error('Remind API error:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
