import GroceryItem from './GroceryItem.jsx';
import { CATEGORIES } from './CategorySheet.jsx';
import './CategoryGroup.css';

export default function CategoryGroup({ category, items, onToggle, onDelete, onUpdate }) {
  const emoji = CATEGORIES.find(c => c.name === category)?.emoji ?? '📦';
  const doneCount = items.filter(i => i.checked).length;

  return (
    <div className="category-group">
      <div className="category-header">
        <span className="category-emoji">{emoji}</span>
        <h2 className="category-title">{category}</h2>
        <span className="category-count">{doneCount}/{items.length}</span>
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
