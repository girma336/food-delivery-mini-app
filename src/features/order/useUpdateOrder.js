// src/features/order/useUpdateOrder.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrder } from '../../services/apiRestaurant';
// import { updateOrder } from '../services/apiOrder';

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates, initData }) =>
      updateOrder(orderId, updates, initData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] }); // wildcard
    },
  });
}
