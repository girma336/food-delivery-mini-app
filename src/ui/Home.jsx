import { useDispatch, useSelector } from 'react-redux';
import CreateUser from '../features/user/CreateUser';
import Button from './Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { validateTelegramInitData } from '../utils/validateTelegram';
import { updateCustomer } from '../features/user/userSlice';
import { useCreateOrGetCustomer } from '../features/menu/useCreateOrGetCustomer';
import Loader from './Loader';

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: createCustomer } = useCreateOrGetCustomer();

  // console.log('Search Params:', searchParams);
  const restaurantId = searchParams.get('restaurantId') || '1';
  // const restaurantId = searchParams.get('restaurantId') || '1';
  const { first_name } = useSelector((state) => state.user);
  // on the param get restaurantId

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
        const res = validateTelegramInitData(
          initData,
          '7919874868:AAEQGn-SnjiZJyrE8S8XhyKqvvS18hp_-Yk'
        );
        console.log('Validation response:', res);

        // Save full customer to localStorage
        localStorage.setItem(
          'customer',
          JSON.stringify({ ...res, restaurantId })
        );
        console.log('Customer data saved to localStorage:', {
          ...res,
          restaurantId,
        });

        createCustomer();

        // Update Redux
        dispatch(
          updateCustomer({
            id: res?.id,
            first_name: res?.first_name,
            last_name: res?.last_name,
            telegram_username: res?.telegram_username,
            avatar_url: res.avatar_url,
            phone: res?.phone,
            language_code: res?.language_code,
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
  }, [dispatch, navigate, restaurantId, createCustomer]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  return (
    <div className="my-10 px-4 text-center sm:my-16">
      <h1 className="mb-8  text-xl font-semibold md:text-3xl">
        The best pizza.
        <br />
        <span className="text-yellow-500">
          Straight out of the oven, straight to you.
        </span>
      </h1>

      {first_name === '' ? (
        <CreateUser />
      ) : (
        <Button to="/menu" type="primary">
          Continue ordering, {first_name}
        </Button>
      )}
    </div>
  );
}

export default Home;
