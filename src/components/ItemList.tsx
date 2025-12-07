import { useState } from 'react';
import './ItemList.css';

interface ItemListProps {
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (index: number) => void;
}

export default function ItemList({ items, onAddItem, onRemoveItem }: ItemListProps) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAddItem(newItem.trim());
      setNewItem('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="item-list-container">
      <h3>Lunch Options</h3>
      <div className="input-group">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a lunch option..."
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul className="item-list">
        {items.map((item, index) => (
          <li key={index}>
            <span>{item}</span>
            <button className="remove-btn" onClick={() => onRemoveItem(index)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
