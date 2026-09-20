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
    let fast2smsDebug = null;

    // 1. FAST2SMS Integration (Instant Indian SMS Gateway)
    const fast2SmsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    if (fast2SmsKey && cleanPhone) {
      try {
        // Attempt 1: Dedicated numeric OTP route (GET)
        const getOtpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2SmsKey)}&route=otp&variables_values=${generatedOtp}&flash=0&numbers=${cleanPhone}`;
        const f2sRes = await fetch(getOtpUrl, { method: 'GET' });
        const f2sData = await f2sRes.json().catch(() => null);
        fast2smsDebug = f2sData;

        if (f2sData && (f2sData.return === true || f2sData.status_code === 200)) {
          smsSent = true;
          provider = 'Fast2SMS (OTP Route)';
        } else {
          console.warn('[Fast2SMS] GET route=otp returned:', f2sData);

          // Attempt 2: Quick SMS route=q without DLT requirement
          const qMsg = `Your Real & Natural login code is ${generatedOtp}. Valid for 5 minutes.`;
          const getQUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2SmsKey)}&route=q&message=${encodeURIComponent(qMsg)}&language=english&flash=0&numbers=${cleanPhone}`;
          const qRes = await fetch(getQUrl, { method: 'GET' });
          const qData = await qRes.json().catch(() => null);

          if (qData && (qData.return === true || qData.status_code === 200)) {
            smsSent = true;
            provider = 'Fast2SMS (Quick Route)';
            fast2smsDebug = qData;
          } else {
            console.warn('[Fast2SMS] GET route=q returned:', qData);

            // Attempt 3: POST method with route=otp
            const postRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
              method: 'POST',
              headers: {
                'authorization': fast2SmsKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                route: 'otp',
                variables_values: String(generatedOtp),
                numbers: cleanPhone,
              }),
            });
            const postData = await postRes.json().catch(() => null);
            if (postData && (postData.return === true || postData.status_code === 200)) {
              smsSent = true;
              provider = 'Fast2SMS (POST Route)';
              fast2smsDebug = postData;
            } else {
              console.warn('[Fast2SMS] POST route=otp returned:', postData);
              fast2smsDebug = postData || qData || f2sData;
            }
          }
        }
      } catch (err) {
        console.error('[Fast2SMS] Exception:', err.message);
        fast2smsDebug = { exception: err.message };
      }
    } else if (!fast2SmsKey && cleanPhone) {
      fast2smsDebug = { 
        warning: 'FAST2SMS_API_KEY environment variable is not present or empty in this deployment runtime' 
      };
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
      hasKey: Boolean(fast2SmsKey),
      debug: fast2smsDebug,
      previewOtp: generatedOtp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
