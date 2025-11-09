import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../services/apiRestaurant';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const customer = JSON.parse(localStorage.getItem('customer'));
  const restaurantId = customer?.restaurantId;

  return useMutation({
    mutationFn: (orderData) =>
      createOrder(orderData, window.Telegram.WebApp.initData, restaurantId),

    onSuccess: ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },

    onError: (error) => {
      console.error('Order creation failed:', error);
    },
  });
}
