import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrGetCustomer } from '../../services/apiRestaurant';

export function useCreateOrGetCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createOrGetCustomer(window.Telegram.WebApp.initData),

    onSuccess: (data) => {
      queryClient.setQueryData(['customer'], data);
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },

    onError: (error) => {
      console.error('Order creation failed:', error);
    },
  });
}
