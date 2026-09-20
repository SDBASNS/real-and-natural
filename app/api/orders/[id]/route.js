import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';

export async function PATCH(request, { params }) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin token' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
