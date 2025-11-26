import React from 'react';
import * as lucide from 'lucide-react';
import { DashboardItem } from './DashboardItem.jsx';

export const CategorySection = ({ 
    category, 
    categoryData, 
    isCollapsed, 
    isEditMode,
    onToggleCollapse, 
    onDeleteCategory,
    onDeleteItem, 
    onEditItem,
    onDropItem,
    onCategoryDrop,
    onCategoryDragOver,
    onCategoryDragLeave
}) => {
    const Icon = isCollapsed ? lucide.ChevronRight : lucide.ChevronDown;
    const CategoryIcon = lucide[categoryData.icon] || lucide.Folder;

    return (
        <section 
            key={category} 
            onDrop={isEditMode ? onCategoryDrop : undefined}
            onDragOver={isEditMode ? onCategoryDragOver : undefined}
            onDragLeave={isEditMode ? onCategoryDragLeave : undefined}
            className={`rounded-xl transition duration-200 ${isEditMode ? 'border border-dashed border-indigo-500' : ''}`}
        >
            {/* Category Header */}
            <div className="flex justify-between items-center w-full p-4 mb-2 text-xl font-bold rounded-xl bg-indigo-500/10 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition duration-200 shadow-md">
                
                {/* Category Title and Collapse Button */}
                <button
                    onClick={() => onToggleCollapse(category)}
                    className="flex items-center space-x-3 group hover:text-indigo-900 dark:hover:text-indigo-100 transition duration-200"
                    title={`Toggle visibility for ${category}`}
                >
                    <Icon size={24} className="text-indigo-500 transition-transform group-hover:scale-110" />
                    <CategoryIcon size={24} className="text-purple-500 dark:text-purple-300" />
                    <span>
                        {category} 
                        <span className="text-base font-normal opacity-80 ml-2">
                            ({categoryData.items.length} items)
                        </span>
                    </span>
                </button>
                
                {/* Category Delete Button */}
                <button
                    onClick={() => onDeleteCategory(category, categoryData.items)}
                    className="p-1 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition duration-200"
                    title={`Delete all ${categoryData.items.length} items in category: ${category}`}
                >
                    <lucide.Trash2 size={20} />
                </button>
            </div>

            {/* Collapsible Content */}
            <div className={`${isCollapsed ? 'hidden' : 'block'} transition-all duration-300 overflow-hidden`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
                    {categoryData.items.map(item => (
                        <DashboardItem
                            key={item.id}
                            item={item}
                            onDelete={onDeleteItem}
                            onEdit={onEditItem}
                            isEditMode={isEditMode}
                            onDropItem={onDropItem}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};