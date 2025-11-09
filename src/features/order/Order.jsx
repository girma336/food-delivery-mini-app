// features/order/OrdersList.tsx
import { useState } from 'react';
import { useOrdersByTelegramUser } from './useOrdersByTelegramUser';
import { formatCurrency, formatDate } from '../../utils/helpers';
import OrderItem from './OrderItem';
import Loader from '../../ui/Loader';
import { useMenuItems } from '../menu/useManuItem';

function Order() {
  const customer = JSON.parse(localStorage.getItem('customer'));
  const restaurantId = customer?.restaurantId;
  const [openId, setOpenId] = useState(null);

  // 1. Get orders
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrdersByTelegramUser();

  // 2. Get menu items (image, name, ingredients)
  const {
    menuItems = [],
    isLoading: menuLoading,
    error: menuError,
  } = useMenuItems(restaurantId);

  // 3. Build lookup map: menu_item_id → menuItem
  const menuMap = {};
  menuItems.forEach((m) => {
    menuMap[m.id] = m;
  });

  // 4. Merge function
  const mergeOrderItems = (orderItems) => {
    return orderItems.map((item) => {
      const menuItem = menuMap[item.menu_item_id] || {};
      return {
        ...item,
        totalPrice:
          item?.total_price || (item.price_at_time || 0) * (item.quantity || 1),
        menuItem: {
          image: menuItem.image_url,
          name: menuItem.name || `Item #${item.menu_item_id}`,
          ingredients: Array.isArray(menuItem.ingredients)
            ? menuItem.ingredients
            : [],
        },
      };
    });
  };

  // Loading & Error
  if (ordersLoading || menuLoading) return <Loader />;
  if (ordersError)
    return <div className="p-6 text-red-600">{ordersError.message}</div>;
  if (menuError)
    return <div className="p-6 text-red-600">{menuError.message}</div>;
  if (!orders.length)
    return <div className="p-6 text-gray-500">No orders yet.</div>;

  return (
    <div className="space-y-4 p-4">
      <h1 className="mb-6 text-2xl font-bold">Your Orders</h1>

      {orders.map((order) => {
        const isOpen = openId === order.id;
        const enrichedItems = mergeOrderItems(order.order_items || []);

        return (
          <div
            key={order.id}
            className="overflow-hidden rounded-lg border bg-white shadow-sm"
          >
            {/* Header */}
            <button
              onClick={() => setOpenId(isOpen ? null : order.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(order.created_at)} • {enrichedItems.length} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(order.total_price)}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </button>

            {/* Accordion Body */}
            {isOpen && (
              <div className="border-t bg-gray-50 px-4 py-3">
                <ul className="space-y-4">
                  {enrichedItems.map((item, i) => (
                    <OrderItem key={i} item={item} menuItem={item.menuItem} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default Order;
