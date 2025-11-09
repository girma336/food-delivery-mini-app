// src/features/customer/useCustomer.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomer } from '../../services/apiRestaurant';
// import { getCustomer } from '../../services/apiCustomer';

export function useCustomer() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (!user?.id) return null;
      return await getCustomer(user.id);
    },
    enabled: !!window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
    staleTime: 1000 * 60 * 10,
    onSuccess: (data) => {
      queryClient.setQueryData(['customer'], data);
    },
  });
}
