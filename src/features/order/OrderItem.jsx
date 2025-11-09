// features/order/OrderItem.jsx
import { formatCurrency } from '../../utils/helpers';

function OrderItem({ item, menuItem }) {
  const { quantity, totalPrice } = item;
  const { image, name, ingredients = [] } = menuItem || {};

  return (
    <li className="flex gap-4 py-3">
      {/* Image */}
      {image && (
        <img
          src={image}
          alt={name}
          className="h-16 w-16 rounded-md object-cover"
        />
      )}

      {/* Details */}
      <div className="flex-1">
        <div className="flex justify-between">
          <p>
            <span className="font-bold">{quantity}×</span>{' '}
            {name || `Item #${item.menu_item_id}`}
          </p>
          <p className="font-bold">{formatCurrency(totalPrice)}</p>
        </div>
        <p className="mt-1 text-sm italic text-stone-500">
          {ingredients.length > 0 ? ingredients.join(', ') : 'No ingredients'}
        </p>
      </div>
    </li>
  );
}

export default OrderItem;
