import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

global.__RN_OTP_STORE__ = global.__RN_OTP_STORE__ || new Map();

export async function POST(request) {
  try {
    const { phone, email } = await request.json();
    const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
    }

    const key = cleanPhone || cleanEmail;
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    global.__RN_OTP_STORE__.set(key, {
      otp: generatedOtp,
      expiresAt,
    });

    let smsSent = false;
    let provider = 'demo';

    // 1. FAST2SMS Integration (Instant Indian SMS Gateway)
    const fast2SmsKey = process.env.FAST2SMS_API_KEY;
    if (fast2SmsKey && cleanPhone) {
      try {
        const f2sRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2SmsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: generatedOtp,
            numbers: cleanPhone,
          }),
        });
        const f2sData = await f2sRes.json();
        if (f2sData && f2sData.return) {
          smsSent = true;
          provider = 'Fast2SMS';
        } else {
          console.warn('[Fast2SMS] SMS response:', f2sData);
        }
      } catch (err) {
        console.error('[Fast2SMS] Exception:', err.message);
      }
    }

    // 2. TWILIO Integration
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    if (!smsSent && twilioSid && twilioAuth && twilioFrom && cleanPhone) {
      try {
        const body = new URLSearchParams({
          To: `+91${cleanPhone}`,
          From: twilioFrom,
          Body: `Your Real & Natural OTP is: ${generatedOtp}. Valid for 5 minutes.`,
        });
        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          }
        );
        if (twilioRes.ok) {
          smsSent = true;
          provider = 'Twilio';
        }
      } catch (err) {
        console.error('[Twilio] Exception:', err.message);
      }
    }

    console.log(`[AUTH] OTP for ${key}: ${generatedOtp} (Provider: ${provider}, Live: ${smsSent})`);

    return NextResponse.json({
      success: true,
      message: smsSent ? `OTP sent via ${provider}` : 'OTP generated',
      isLiveSms: smsSent,
      previewOtp: smsSent ? undefined : generatedOtp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
