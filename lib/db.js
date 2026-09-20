import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from './supabase.js';

const dataDir = path.join(process.cwd(), 'data');
const ordersFile = path.join(dataDir, 'orders.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([], null, 2), 'utf8');
  }
}

function getLocalOrders() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Failed to read local orders:', err);
    return [];
  }
}

function saveLocalOrder(newOrder) {
  ensureDataFile();
  const orders = getLocalOrders();
  orders.unshift(newOrder);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
  return newOrder;
}

function updateLocalOrderStatus(orderId, status) {
  ensureDataFile();
  const orders = getLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
  return orders[index];
}

/**
 * Format a Supabase row back to the application standard Order object
 */
function formatSupabaseOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      email: row.customer_email || '',
      address: row.customer_address,
      city: row.customer_city,
      state: row.customer_state,
      pincode: row.customer_pincode,
    },
    paymentMethod: row.payment_method,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    shipping: Number(row.shipping) || 0,
    total: Number(row.total) || 0,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    shiprocketOrderId: row.shiprocket_order_id,
    shiprocketShipmentId: row.shiprocket_shipment_id,
    trackingNumber: row.tracking_number,
    notes: row.notes,
  };
}

/**
 * Convert an Order object to Supabase database columns
 */
function toSupabaseRow(order) {
  return {
    id: order.id,
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || new Date().toISOString(),
    status: order.status || 'Pending',
    customer_name: order.customer.name,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || '',
    customer_address: order.customer.address,
    customer_city: order.customer.city,
    customer_state: order.customer.state,
    customer_pincode: order.customer.pincode,
    payment_method: order.paymentMethod || 'COD',
    items: order.items || [],
    subtotal: order.subtotal,
    discount: order.discount || 0,
    shipping: order.shipping || 0,
    total: order.total,
    razorpay_order_id: order.razorpayOrderId || null,
    razorpay_payment_id: order.razorpayPaymentId || null,
    shiprocket_order_id: order.shiprocketOrderId || null,
    shiprocket_shipment_id: order.shiprocketShipmentId || null,
    tracking_number: order.trackingNumber || null,
    notes: order.notes || null,
  };
}

/**
 * Fetch all orders (prefers Supabase if configured, falls back to local data)
 */
export async function getOrders() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getOrders error, falling back to local:', error.message);
        return getLocalOrders();
      }
      return data.map(formatSupabaseOrder);
    } catch (err) {
      console.error('Supabase getOrders exception, fallback to local:', err);
      return getLocalOrders();
    }
  }
  return getLocalOrders();
}

/**
 * Save a new order (saves to Supabase and mirrors to local backup)
 */
export async function saveOrder(orderInput) {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = `RN-${randomSuffix}`;

  const newOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    customer: {
      name: orderInput.name,
      phone: orderInput.phone,
      email: orderInput.email || '',
      address: orderInput.address,
      city: orderInput.city,
      state: orderInput.state,
      pincode: orderInput.pincode,
    },
    paymentMethod: orderInput.payment || 'COD',
    items: orderInput.items || [],
    subtotal: orderInput.subtotal,
    discount: orderInput.discount || 0,
    shipping: orderInput.shipping || 0,
    total: orderInput.total,
    razorpayOrderId: orderInput.razorpayOrderId || null,
    razorpayPaymentId: orderInput.razorpayPaymentId || null,
  };

  // Always mirror to local file for backup
  saveLocalOrder(newOrder);

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const row = toSupabaseRow(newOrder);
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error (order saved locally):', error.message);
      } else if (data) {
        return formatSupabaseOrder(data);
      }
    } catch (err) {
      console.error('Supabase saveOrder exception (order saved locally):', err);
    }
  }

  return newOrder;
}

/**
 * Update order status (updates in Supabase and local backup)
 */
export async function updateOrderStatus(orderId, status) {
  // Update local file backup
  const localUpdated = updateLocalOrderStatus(orderId, status);

  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update status error:', error.message);
        return localUpdated;
      }
      return formatSupabaseOrder(data);
    } catch (err) {
      console.error('Supabase updateOrderStatus exception:', err);
      return localUpdated;
    }
  }

  return localUpdated;
}
