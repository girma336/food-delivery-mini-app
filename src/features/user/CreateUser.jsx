// components/CreateUser.jsx
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateCustomer } from './userSlice';
import { useNavigate } from 'react-router-dom';
import { validateTelegramInitData } from '../../utils/validateTelegram';

function CreateUser() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function authenticateWithTelegram() {
      if (!window.Telegram?.WebApp?.initData) {
        if (!mounted) return;
        setError('Please open this app inside Telegram');
        setIsLoading(false);
        return;
      }

      const initData = window.Telegram.WebApp.initData;

      try {
        // POST initData to your backend endpoint which validates using the bot token
        const res = await validateTelegramInitData(
          initData,
          '8123823632:AAFn-fc_pEDIXplSjuTlrJ96Cwe9RoBkywo'
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Authentication failed');
        }

        const { customer } = await res.json();

        // Save full customer to localStorage
        localStorage.setItem('customer', JSON.stringify(customer));
        console.log('Customer data saved to localStorage:', customer);

        // Update Redux
        dispatch(
          updateCustomer({
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            telegram_username: customer.telegram_username,
            avatar_url: customer.avatar_url,
            phone: customer.phone,
            language_code: customer.language_code,
          })
        );

        // Redirect
        navigate('/menu');
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Authentication failed');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    authenticateWithTelegram();
    return () => {
      mounted = false;
    };
  }, [dispatch, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Connecting to Telegram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
}

export default CreateUser;
