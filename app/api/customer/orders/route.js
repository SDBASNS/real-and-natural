import { NextResponse } from 'next/server';
import { getCustomerOrders } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || '';
    const email = searchParams.get('email') || '';
    const orderId = searchParams.get('orderId') || '';

    if (!phone && !email && !orderId) {
      return NextResponse.json(
        { error: 'Phone number, email, or order ID is required' },
        { status: 400 }
      );
    }

    const orders = await getCustomerOrders({ phone, email, orderId });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
