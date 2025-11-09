import { useSelector } from 'react-redux';
import { useMenuItems } from './useManuItem';
import MenuItem from './MenuItem';
import Loader from '../../ui/Loader';
import CartOverview from '../cart/CartOverview';
function Menu() {
  // const menu = useLoaderData();
  const { customerId } = useSelector((state) => state.user);
  const restaurantId = localStorage.getItem('customer')
    ? JSON.parse(localStorage.getItem('customer')).restaurantId
    : 2;
  console.log('Restaurant ID in Menu component:', customerId, restaurantId);
  const { isLoading, error, menuItems } = useMenuItems(restaurantId);
  console.log('Menu items in Menu component:', menuItems);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading menu: {error.message}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-stone-200 px-2">
      {menuItems?.map((pizza) => (
        <MenuItem pizza={pizza} key={pizza.id} />
      ))}
      <CartOverview />
    </ul>
  );
}

export default Menu;
