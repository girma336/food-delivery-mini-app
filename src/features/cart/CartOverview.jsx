// src/features/cart/CartOverview.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ← Add this
import { getTotalCartPrice, getTotalCartQuantity } from './cartSlice';
import { formatCurrency } from '../../utils/helpers';

function CartOverview() {
  const totalCartQuantity = useSelector(getTotalCartQuantity);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const tg = window.Telegram?.WebApp;
  const navigate = useNavigate(); // ← React Router

  useEffect(() => {
    if (!tg?.MainButton) return;

    if (totalCartQuantity > 0) {
      tg.MainButton.setText(
        `${totalCartQuantity} item${
          totalCartQuantity > 1 ? 's' : ''
        } · ${formatCurrency(totalCartPrice)}`
      )
        .setParams({
          color: '#e4bc0e',
          text_color: '#FFFFFF',
        })
        .show()
        .onClick(() => {
          navigate('/cart'); // ← Stays inside Mini App
        });
    } else {
      tg.MainButton.hide();
    }

    return () => {
      if (tg.MainButton.isVisible) {
        tg.MainButton.hide();
      }
    };
  }, [totalCartQuantity, totalCartPrice, tg, navigate]);

  return null;
}

export default CartOverview;
