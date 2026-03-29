import GroceryItem from './GroceryItem.jsx';
import './CategoryGroup.css';

export default function CategoryGroup({ category, items, onToggle, onCheck, onDelete, onUpdate }) {
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
            onCheck={onCheck}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </div>
  );
}
