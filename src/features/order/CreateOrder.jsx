// src/features/order/CreateOrder.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateOrder } from './useCreateOrder';
import Button from '../../ui/Button';
import EmptyCart from '../cart/EmptyCart';
import { getCart, getTotalCartPrice } from '../cart/cartSlice';
import { formatCurrency } from '../../utils/helpers';
import { fetchAddress } from '../user/userSlice';
import { useDispatch } from 'react-redux';

// Phone validation regex
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const restaurantId = localStorage.getItem('restaurantId') || 1;

  const {
    username,
    address,
    position,
    addressStatus,
    error: errorAddress,
  } = useSelector((state) => state.user);
  const isLoadingAddress = addressStatus === 'loading';

  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();

  if (!cart.length) return <EmptyCart />;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get('phone');

    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setPhoneError('');

    const orderData = {
      address: formData.get('address'),
      location: position.latitude
        ? { lat: position.latitude, lng: position.longitude }
        : undefined,
      totalPrice,
      status: 'pending',
      cart: cart.map((item) => ({
        id: item.pizzaId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    createOrder(orderData, {
      onSuccess: ({ orderId }) => {
        navigate(`/order/${orderId}`);
      },
    });
  };

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input grow"
            type="text"
            name="customer"
            defaultValue={username}
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className="input w-full" type="tel" name="phone" required />
            {phoneError && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              defaultValue={address}
              disabled={isLoadingAddress}
              required
            />
            {addressStatus === 'error' && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-xs text-red-700">
                {errorAddress}
              </p>
            )}
          </div>

          {!position.latitude && !position.longitude && (
            <span className="absolute right-[3px] top-[3px] z-50 md:right-[5px] md:top-[5px]">
              <Button
                disabled={isLoadingAddress}
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            id="priority"
            checked={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to give your order priority? (+20%)
          </label>
        </div>

        <div>
          <Button
            disabled={isSubmitting || isLoadingAddress}
            type="primary"
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? 'Placing order...'
              : `Order now for ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrder;
