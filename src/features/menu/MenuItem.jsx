// src/features/menu/MenuItem.jsx
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../ui/Button';
import DeleteItem from '../cart/DeleteItem';
import UpdateItemQuantity from '../cart/UpdateItemQuantity';
import { formatCurrency } from '../../utils/helpers';
import { addItem, getCurrentQuantityById } from '../cart/cartSlice';

function MenuItem({ pizza }) {
  const dispatch = useDispatch();
  const {
    id,
    name,
    price: unitPrice,
    ingredients,
    soldOut,
    image_url: imageUrl,
  } = pizza;

  const currentQuantity = useSelector(getCurrentQuantityById(id));
  const isInCart = currentQuantity > 0;

  function handleAddToCart() {
    const newItem = {
      pizzaId: id,
      name,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice * 1,
    };
    dispatch(addItem(newItem));
  }
  // MainButton from Telegram Web App API

  return (
    <li className="flex flex-row gap-4 border-b border-stone-200 py-4 last:border-0 sm:flex-row">
      {/* Image */}
      <div className="flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className={`h-20 w-20 rounded-lg object-cover shadow-sm sm:h-24 sm:w-24 ${
            soldOut ? 'opacity-60 grayscale' : ''
          }`}
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate text-base font-semibold text-stone-800 sm:text-lg">
            {name}
          </h3>
          <p className="mt-1 line-clamp-4 text-xs capitalize italic text-stone-500 sm:text-sm">
            {ingredients.join(', ')}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-3 flex items-center justify-between sm:mt-0">
          {/* Price */}
          <p
            className={`text-sm font-bold sm:text-base ${
              soldOut ? 'text-stone-400' : 'text-red-600'
            }`}
          >
            {!soldOut ? formatCurrency(unitPrice) : 'Sold out'}
          </p>

          {/* Cart Controls */}
          <div className="flex items-center gap-2">
            {isInCart && (
              <>
                <UpdateItemQuantity
                  pizzaId={id}
                  currentQuantity={currentQuantity}
                />
                <DeleteItem pizzaId={id} />
              </>
            )}

            {!soldOut && !isInCart && (
              <Button
                type="small"
                onClick={handleAddToCart}
                className="px-3 py-1.5 text-xs sm:text-sm"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default MenuItem;
