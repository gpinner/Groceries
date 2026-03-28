import GroceryItem from './GroceryItem.jsx';
import './CategoryGroup.css';

export default function CategoryGroup({ category, items, onToggle, onDelete, onUpdate }) {
  return (
    <div className="category-group">
      <div className="category-divider">
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
