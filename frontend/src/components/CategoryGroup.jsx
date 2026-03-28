import GroceryItem from './GroceryItem.jsx';
import { CATEGORIES } from '../data/categories.js';
import './CategoryGroup.css';

export default function CategoryGroup({ category, items, onToggle, onDelete, onUpdate }) {
  const emoji = CATEGORIES.find(c => c.name === category)?.emoji ?? '📦';

  return (
    <div className="category-group">
      <div className="category-divider">
        <span className="divider-emoji">{emoji}</span>
        <span className="divider-label">{category}</span>
      </div>
      <ul className="item-list">
        {items.map(item => (
          <GroceryItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </div>
  );
}
