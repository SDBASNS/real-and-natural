import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase.js';

// Safe directory resolver that NEVER writes to read-only filesystems (/var/task)
function getDataDir() {
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    (typeof process.cwd === 'function' && process.cwd().includes('var/task'))
  ) {
    return os.tmpdir();
  }

  const localDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDataDir)) {
      fs.mkdirSync(localDataDir, { recursive: true });
    }
    const testFile = path.join(localDataDir, '.write_check');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return localDataDir;
  } catch (_) {
    return os.tmpdir();
  }
}

function getOrdersFilePath() {
  return path.join(getDataDir(), 'orders.json');
}

function ensureDataFile() {
  try {
    const targetDir = getDataDir();
    const targetFile = getOrdersFilePath();
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    if (!fs.existsSync(targetFile)) {
      const seedFile = path.join(process.cwd(), 'data', 'orders.json');
      if (seedFile !== targetFile && fs.existsSync(seedFile)) {
        try {
          fs.copyFileSync(seedFile, targetFile);
          return;
        } catch (_) {}
      }
      try {
        fs.writeFileSync(targetFile, JSON.stringify([], null, 2), 'utf8');
      } catch (_) {}
    }
  } catch (err) {
    console.warn('[DB] Local file cache warning (non-fatal):', err.message);
  }
}

function getLocalOrders() {
  try {
    ensureDataFile();
    const targetFile = getOrdersFilePath();
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, 'utf8');
      return JSON.parse(raw) || [];
    }
    const seedFile = path.join(process.cwd(), 'data', 'orders.json');
    if (fs.existsSync(seedFile)) {
      const raw = fs.readFileSync(seedFile, 'utf8');
      return JSON.parse(raw) || [];
    }
  } catch (err) {
    console.warn('[DB] Failed to read local orders (non-fatal):', err.message);
  }
  return [];
}

function saveLocalOrder(newOrder) {
  try {
    ensureDataFile();
    const targetFile = getOrdersFilePath();
    const orders = getLocalOrders();
    orders.unshift(newOrder);
    fs.writeFileSync(targetFile, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB] Failed to save local order backup (non-fatal):', err.message);
  }
  return newOrder;
}

function updateLocalOrderStatus(orderId, status) {
  try {
    ensureDataFile();
    const targetFile = getOrdersFilePath();
    const orders = getLocalOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    fs.writeFileSync(targetFile, JSON.stringify(orders, null, 2), 'utf8');
    return orders[index];
  } catch (err) {
    console.warn('[DB] Failed to update local order status (non-fatal):', err.message);
    return null;
  }
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
  const admin = getSupabaseAdmin();
  if (isSupabaseConfigured() && admin) {
    try {
      const { data, error } = await admin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[DB] Supabase getOrders error, using local fallback:', error.message);
        return getLocalOrders();
      }
      return data.map(formatSupabaseOrder);
    } catch (err) {
      console.error('[DB] Supabase getOrders exception, using local fallback:', err);
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
    status: orderInput.paymentStatus || orderInput.status || 'Pending',
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
    notes: orderInput.notes || null,
  };

  // 1. If Supabase is configured, write directly to Supabase cloud database
  const admin = getSupabaseAdmin();
  if (isSupabaseConfigured() && admin) {
    try {
      const row = toSupabaseRow(newOrder);
      const { data, error } = await admin
        .from('orders')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error('[DB] Supabase insert error, falling back to local:', error.message);
      } else if (data) {
        // Asynchronously mirror to local/tmp backup without blocking or throwing
        saveLocalOrder(newOrder);
        return formatSupabaseOrder(data);
      }
    } catch (err) {
      console.error('[DB] Supabase saveOrder exception, falling back to local:', err.message);
    }
  }

  // 2. Local fallback (uses safe /tmp on Vercel)
  saveLocalOrder(newOrder);
  return newOrder;
}

/**
 * Update order status (updates in Supabase and local backup)
 */
export async function updateOrderStatus(orderId, status) {
  const admin = getSupabaseAdmin();
  if (isSupabaseConfigured() && admin) {
    try {
      const { data, error } = await admin
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('[DB] Supabase update status error:', error.message);
      } else if (data) {
        updateLocalOrderStatus(orderId, status);
        return formatSupabaseOrder(data);
      }
    } catch (err) {
      console.error('[DB] Supabase updateOrderStatus exception:', err.message);
    }
  }

  return updateLocalOrderStatus(orderId, status);
}

/**
 * Fetch orders for a customer by Phone Number, Email, or Order ID
 */
export async function getCustomerOrders({ phone, email, orderId }) {
  const allOrders = await getOrders();
  if (!phone && !email && !orderId) return [];

  const cleanPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';
  const cleanOrderId = orderId ? String(orderId).trim().toUpperCase() : '';

  return allOrders.filter((order) => {
    const custPhone = order.customer?.phone ? String(order.customer.phone).replace(/\D/g, '').slice(-10) : '';
    const custEmail = order.customer?.email ? String(order.customer.email).trim().toLowerCase() : '';
    const id = order.id ? String(order.id).trim().toUpperCase() : '';

    if (cleanOrderId && id === cleanOrderId) return true;
    if (cleanPhone && custPhone === cleanPhone) return true;
    if (cleanEmail && custEmail === cleanEmail) return true;
    return false;
  });
}
