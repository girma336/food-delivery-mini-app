import { getMenuItems } from '../../services/apiRestaurant';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export function useMenuItems(restaurantId) {
  const queryClient = useQueryClient();
  const {
    isLoading,
    data: menuItems,
    error,
  } = useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: () => getMenuItems(restaurantId),

    // enabled: !!restaurantId, // only fetch if user is available
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      console.log('Fetched menu items:', data);
      queryClient.setQueryData(['menu-items', restaurantId], data);
    },
  });

  return { isLoading, error, menuItems };
}
