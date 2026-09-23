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
    let emailSent = false;
    let provider = 'demo';
    let fast2smsDebug = null;
    let emailDebug = null;

    // A. EMAIL OTP DISPATCH ENGINE
    if (cleanEmail) {
      const emailSubject = `🔐 ${generatedOtp} is your Real & Natural Login OTP`;
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #173B2A; padding: 24px; text-align: center;">
            <h1 style="color: #F7F1E5; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">REAL &amp; NATURAL</h1>
            <p style="color: #C49A4A; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Premium Natural Raisins &amp; Dry Fruits</p>
          </div>
          <div style="padding: 32px 24px; text-align: center; color: #173B2A;">
            <h2 style="font-size: 18px; margin-top: 0; color: #173B2A;">Your One-Time Password (OTP)</h2>
            <p style="font-size: 14px; color: #6B4432; line-height: 1.5; margin-bottom: 24px;">
              Use the 4-digit code below to securely sign in to your Real &amp; Natural account:
            </p>
            <div style="background-color: #F7F1E5; border: 2px dashed #C49A4A; border-radius: 12px; padding: 16px 28px; display: inline-block; margin-bottom: 24px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #173B2A;">${generatedOtp}</span>
            </div>
            <p style="font-size: 12px; color: #888888; margin-bottom: 0;">
              ⏱️ Valid for <strong>5 minutes</strong>. Please do not share this OTP with anyone.
            </p>
          </div>
          <div style="background-color: #F7F1E5; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #6B4432; margin: 0;">
              Sent with ❤️ by Real &amp; Natural • <a href="https://real-and-natural-one.vercel.app" style="color: #173B2A; font-weight: bold; text-decoration: none;">realandnatural.com</a>
            </p>
          </div>
        </div>
      `;

      // 1. Supabase Auth Native Email OTP
      const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
      const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
      
      if (supabaseUrl && supabaseKey) {
        try {
          const supaRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const supaData = await supaRes.json().catch(() => null);
          if (supaRes.ok) {
            emailSent = true;
            provider = 'Supabase Email Auth';
            emailDebug = supaData;
          }
        } catch (err) {
          console.warn('[Supabase Auth Email] Exception:', err.message);
        }
      }

      // 2. Resend Email API
      const resendKey = (process.env.RESEND_API_KEY || '').trim();
      if (!emailSent && resendKey) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Real & Natural <onboarding@resend.dev>',
              to: [cleanEmail],
              subject: emailSubject,
              html: emailHtml,
            }),
          });
          const resendData = await resendRes.json().catch(() => null);
          if (resendRes.ok && resendData?.id) {
            emailSent = true;
            provider = 'Resend Email API';
            emailDebug = resendData;
          } else {
            emailDebug = resendData;
          }
        } catch (err) {
          console.warn('[Resend API] Exception:', err.message);
        }
      }

      // 3. Brevo (Sendinblue) API
      const brevoKey = (process.env.BREVO_API_KEY || '').trim();
      if (!emailSent && brevoKey) {
        try {
          const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': brevoKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'Real & Natural', email: 'noreply@realandnatural.com' },
              to: [{ email: cleanEmail }],
              subject: emailSubject,
              htmlContent: emailHtml,
            }),
          });
          const brevoData = await brevoRes.json().catch(() => null);
          if (brevoRes.ok) {
            emailSent = true;
            provider = 'Brevo Email API';
            emailDebug = brevoData;
          }
        } catch (err) {
          console.warn('[Brevo API] Exception:', err.message);
        }
      }
    }

    // B. FAST2SMS Integration (Instant Indian SMS Gateway)
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

    // C. TWILIO Integration
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

    const isLive = smsSent || emailSent;
    console.log(`[AUTH] OTP for ${key}: ${generatedOtp} (Provider: ${provider}, Live: ${isLive})`);

    return NextResponse.json({
      success: true,
      message: isLive ? `OTP sent via ${provider}` : 'OTP generated',
      isLiveSms: smsSent,
      isLiveEmail: emailSent,
      provider,
      hasKey: Boolean(fast2SmsKey || process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL),
      debug: fast2smsDebug || emailDebug,
      previewOtp: generatedOtp,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
