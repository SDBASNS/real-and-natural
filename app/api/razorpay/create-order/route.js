import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, receipt, notes } = body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if keys are missing or still set to placeholders
    const isPlaceholder =
      !keyId ||
      !keySecret ||
      keyId.includes('YourKeyIdHere') ||
      keySecret.includes('YourSecretKeyHere');

    if (isPlaceholder) {
      // Provide a clean fallback simulation for local testing before real keys are inserted
      return NextResponse.json({
        id: `order_sim_${Date.now()}`,
        entity: 'order',
        amount: Math.round(Number(amount) * 100),
        amount_paid: 0,
        amount_due: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: notes || {},
        created_at: Math.floor(Date.now() / 1000),
        isMock: true,
        message: 'Simulated order created. Add real Razorpay keys to .env.local for live gateway processing.',
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay accepts amounts in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error in Razorpay create-order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
