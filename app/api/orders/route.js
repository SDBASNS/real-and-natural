import { NextResponse } from 'next/server';
import { getOrders, saveOrder } from '@/lib/db';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing admin token' },
        { status: 401 }
      );
    }

    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, city, state, pincode, items, subtotal, total, payment } = body;

    // Support both frontend field names and direct Supabase column names
    const customerName = name || body.customer_name;
    const customerPhone = phone || body.customer_phone;
    const customerAddress = address || body.customer_address;
    const customerCity = city || body.customer_city;
    const customerState = state || body.customer_state;
    const customerPincode = pincode || body.customer_pincode;
    const paymentMethod = payment || body.payment_method || 'COD';
    const shippingFee = body.shipping !== undefined ? body.shipping : (body.delivery_charge !== undefined ? body.delivery_charge : 0);

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!customerPhone || !/^\d{10}$/.test(customerPhone.trim())) {
      return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 });
    }
    if (!customerAddress || !customerAddress.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!customerCity || !customerCity.trim()) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    if (!customerState || !customerState.trim()) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }
    if (!customerPincode || !/^\d{6}$/.test(customerPincode.trim())) {
      return NextResponse.json({ error: 'Valid 6-digit pincode is required' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    const order = await saveOrder({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: body.email ? body.email.trim() : (body.customer_email ? body.customer_email.trim() : ''),
      address: customerAddress.trim(),
      city: customerCity.trim(),
      state: customerState.trim(),
      pincode: customerPincode.trim(),
      payment: paymentMethod,
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(body.discount) || 0,
      shipping: Number(shippingFee) || 0,
      total: Number(total) || 0,
      notes: body.notes || '',
      paymentStatus: body.paymentStatus || (paymentMethod === 'COD' ? 'Pending' : 'Pending Verification'),
      razorpayOrderId: body.paymentOrderId || body.razorpayOrderId || null,
      razorpayPaymentId: body.paymentId || body.razorpayPaymentId || null,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}