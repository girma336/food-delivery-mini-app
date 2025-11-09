// hooks/useOrdersByTelegramUser.js
import { useQuery } from '@tanstack/react-query';
import { getOrdersByTelegramUser } from '../../services/apiRestaurant';

export function useOrdersByTelegramUser() {
  const initData = window.Telegram?.WebApp?.initData;
  const customer = JSON.parse(localStorage.getItem('customer'));
  const restaurantId = customer?.restaurantId;
  return useQuery({
    queryKey: ['orders', 'telegram'],
    queryFn: () => getOrdersByTelegramUser(initData, restaurantId),
    enabled: !!initData,
    staleTime: 1000 * 60,
    retry: 1,
  });
}
