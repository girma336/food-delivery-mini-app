// src/features/cart/Cart.jsx
import Button from '../../ui/Button';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart } from './cartSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

function Cart() {
  const username = useSelector((state) => state.user.username);
  const cart = useSelector(getCart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg?.BackButton || !tg?.MainButton) return;

    const backButton = tg.BackButton;
    const mainButton = tg.MainButton;

    // === BACK BUTTON ===
    // Only show/hide + click — NO setText!
    backButton.show().onClick(() => {
      navigate('/menu');
    });

    // === MAIN BUTTON (Checkout) ===
    const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    mainButton
      .setText(`Checkout · ${formatCurrency(totalPrice)}`)
      .setParams({
        color: '#f97316',
        text_color: '#ffffff',
      })
      .show()
      .onClick(() => {
        navigate('/order/new');
      });

    // === CLEANUP ===
    return () => {
      backButton.hide();
      mainButton.hide();
    };
  }, [tg, navigate, cart]);
  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-3">
      <h2 className="mt-7 text-xl font-semibold">Your cart, {username}</h2>

      <ul className="mt-3 divide-y divide-stone-200 border-b">
        {cart.map((item) => (
          <CartItem item={item} key={item.pizzaId} />
        ))}
      </ul>

      <div className="mt-6 space-x-2">
        <Button to="/order/new" type="primary">
          Order now
        </Button>

        <Button
          type="secondary"
          onClick={() => {
            dispatch(clearCart());
            navigate('/menu');
          }}
        >
          Clear cart
        </Button>
      </div>
    </div>
  );
}

export default Cart;
