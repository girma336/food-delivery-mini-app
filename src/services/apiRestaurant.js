import { validateTelegramInitData } from '../utils/validateTelegram.js';
import supabase from './supabase.js';
const BOT_TOKEN = '8123823632:AAFn-fc_pEDIXplSjuTlrJ96Cwe9RoBkywo'; // Set in .env

export async function getOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        quantity,
        price_at_time,
        menu_items (name, image_url)
      ),
      restaurants (name)
    `
    )
    .eq('id', id)
    .single();

  if (error || !data) throw new Error(`Order #${id} not found`);
  return data;
}

export async function createOrder(orderData, initData, restaurantId) {
  console.log(
    'Creating order with data:',
    orderData,
    'for restaurant ID:',
    restaurantId
  );
  const user = validateTelegramInitData(initData, BOT_TOKEN);
  if (!user) throw new Error('Invalid Telegram user');
  const customer = await createOrGetCustomer(initData);
  if (!customer) throw new Error('Customer not found');
  console.log('Customer for order:', customer);
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_id: customer.id,
      restaurant_id: restaurantId,
      address: orderData.address || null,
      // location: orderData.location
      //   ? `POINT(${orderData.location.lng} ${orderData.location.lat})`
      //   : null,
      total_price: orderData.totalPrice,
      order_items: orderData.cart.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.unitPrice,
      })),
    })
    .select()
    .single();

  if (error) {
    console.error('create_order_with_items failed:', error);
    throw new Error(error.message || 'Failed to create order');
  }

  return { orderId: data.id };
}

export async function getOrdersByTelegramUser(initData, restaurantId) {
  // 1. Validate Telegram user
  const user = validateTelegramInitData(initData, BOT_TOKEN);
  if (!user) throw new Error('Invalid Telegram user');

  const telegramId = user.id.toString();

  // 2. Find customer
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .select('id')
    .eq('telegram_id', telegramId)
    .single();

  if (custErr || !customer) throw new Error('Customer not found');

  // 3. Fetch orders – NO restaurant join
  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
     id,
     total_price,
     status,
     created_at,
     order_items
   `
    )
    .eq('customer_id', customer.id)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 4. Safe normalization
  return (orders || []).map((order) => ({
    id: Number(order.id) || 0,
    total_price: Number(order.total_price) || 0,
    status: String(order.status || 'pending'),
    created_at: String(order.created_at || new Date().toISOString()),
    order_items: Array.isArray(order.order_items) ? order.order_items : [],
  }));
}

export async function getCustomer(telegramId) {
  const { data, error } = await supabase
    .from('customers')
    .select('id, telegram_id, first_name, telegram_username, avatar_url')
    .eq('telegram_id', telegramId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createOrGetCustomer(initData) {
  const user = validateTelegramInitData(initData, BOT_TOKEN);
  if (!user) throw new Error('Invalid Telegram authentication');

  const { data: customerId, error: rpcError } = await supabase.rpc(
    'get_or_create_customer',
    {
      p_telegram_id: user.id,
      p_first_name: user.first_name || 'Guest',
      p_last_name: user.last_name || null,
      p_telegram_username: user.username || null,
      p_avatar_url: user.photo_url || null,
      p_language_code: user.language_code || 'en',
    }
  );

  if (rpcError) throw rpcError;

  // 3. Fetch full customer record
  const { data, error } = await supabase
    .from('customers')
    .select('id, first_name, last_name, telegram_username, avatar_url, phone')
    .eq('id', customerId)
    .single();

  if (error) {
    console.error('Failed to create customer:', error);
    throw new Error(error.message || 'Failed to create customer');
  }

  return data;
}

export async function updateOrder(orderId, updates, initData) {
  const user = validateTelegramInitData(initData, BOT_TOKEN);
  if (!user) throw new Error('Invalid Telegram authentication');

  // Get customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('telegram_id', user.id)
    .single();

  if (!customer) throw new Error('Customer not found');

  // Check ownership
  const { data: order } = await supabase
    .from('orders')
    .select('customer_id, status')
    .eq('id', orderId)
    .single();

  if (!order) throw new Error('Order not found');
  if (order.customer_id !== customer.id) {
    throw new Error('Not authorized to update this order');
  }

  // Optional: Prevent update after certain status
  const blockedStatuses = ['picked_up', 'delivered', 'cancelled'];
  if (blockedStatuses.includes(order.status)) {
    throw new Error(`Cannot update order with status: ${order.status}`);
  }

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) throw error;

  return { success: true };
}

export async function getMenuItems(restaurantId) {
  console.log('Fetching menu items for restaurant ID:', restaurantId);
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', Number(restaurantId))
    // .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
