import { useState } from 'react';
import './CategoryManager.css';

export interface Category {
    id: string;
    name: string;
    items: string[];
}

interface CategoryManagerProps {
    categories: Category[];
    onUpdateCategories: (categories: Category[]) => void;
    onClose: () => void;
}

export default function CategoryManager({ categories, onUpdateCategories, onClose }: CategoryManagerProps) {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [newItemNames, setNewItemNames] = useState<Record<string, string>>({});

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            const newCategory: Category = {
                id: crypto.randomUUID(),
                name: newCategoryName.trim(),
                items: []
            };
            onUpdateCategories([...categories, newCategory]);
            setNewCategoryName('');
        }
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            onUpdateCategories(categories.filter(c => c.id !== id));
        }
    };

    const handleAddItem = (categoryId: string) => {
        const itemName = newItemNames[categoryId]?.trim();
        if (itemName) {
            const updatedCategories = categories.map(c => {
                if (c.id === categoryId) {
                    return { ...c, items: [...c.items, itemName] };
                }
                return c;
            });
            onUpdateCategories(updatedCategories);
            setNewItemNames(prev => ({ ...prev, [categoryId]: '' }));
        }
    };

    const handleDeleteItem = (categoryId: string, itemIndex: number) => {
        const updatedCategories = categories.map(c => {
            if (c.id === categoryId) {
                return { ...c, items: c.items.filter((_, i) => i !== itemIndex) };
            }
            return c;
        });
        onUpdateCategories(updatedCategories);
    };

    const toggleExpand = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    return (
        <div className="manager-container">
            <div className="manager-header">
                <h2>Manage Menu</h2>
                <button className="close-btn" onClick={onClose}>Done</button>
            </div>

            <div className="add-category-section">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name (e.g. Korean)"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button onClick={handleAddCategory}>Add Category</button>
            </div>

            <div className="category-list">
                {categories.map(category => (
                    <div key={category.id} className="category-card">
                        <div className="category-header" onClick={() => toggleExpand(category.id)}>
                            <span className="category-name">{category.name} ({category.items.length})</span>
                            <div className="category-actions">
                                <button
                                    className="delete-cat-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                                >
                                    Delete
                                </button>
                                <span className={`chevron ${expandedCategory === category.id ? 'expanded' : ''}`}>▼</span>
                            </div>
                        </div>

                        {expandedCategory === category.id && (
                            <div className="category-content">
                                <div className="add-item-row">
                                    <input
                                        type="text"
                                        value={newItemNames[category.id] || ''}
                                        onChange={(e) => setNewItemNames(prev => ({ ...prev, [category.id]: e.target.value }))}
                                        placeholder={`Add item to ${category.name}...`}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category.id)}
                                    />
                                    <button onClick={() => handleAddItem(category.id)}>Add</button>
                                </div>
                                <ul className="manager-item-list">
                                    {category.items.map((item, index) => (
                                        <li key={index}>
                                            <span>{item}</span>
                                            <button
                                                className="delete-item-btn"
                                                onClick={() => handleDeleteItem(category.id, index)}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                    {category.items.length === 0 && (
                                        <li className="empty-msg">No items yet. Add some!</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
