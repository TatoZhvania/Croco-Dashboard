import React from 'react';
import { IconComponent } from '../../utils/icons.jsx';
import { DashboardItem } from './DashboardItem.jsx';

// We'll use react-icons for the collapse and trash icons too
import { FaPencilAlt } from "react-icons/fa";
import { FaChevronRight, FaChevronDown, FaTrash, } from 'react-icons/fa';

export const CategorySection = ({ 
    category, 
    categoryData, 
    isCollapsed, 
    isEditMode,
    canManage,
    onToggleCollapse, 
    onDeleteCategory,
    onDeleteItem, 
    onEditItem,
    onDropItem,
    onCategoryDrop,
    onCategoryDragOver,
    onCategoryDragLeave,
    onOpenEditCategory
}) => {
    const CollapseIcon = isCollapsed ? FaChevronRight : FaChevronDown;
    const allowDrag = canManage && isEditMode;

    return (
        <section 
            key={category} 
            onDrop={allowDrag ? onCategoryDrop : undefined}
            onDragOver={allowDrag ? onCategoryDragOver : undefined}
            onDragLeave={allowDrag ? onCategoryDragLeave : undefined}
            className={`rounded-xl transition duration-200 ${allowDrag ? 'border border-dashed border-indigo-500' : ''}`}
        >
            {/* Category Header */}
            <div className="flex justify-between items-center w-full p-4 mb-2 text-xl font-bold rounded-xl bg-indigo-500/10 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition duration-200 shadow-md">
                
                {/* Category Title and Collapse Button */}
                <button
                    onClick={() => onToggleCollapse(category)}
                    className="flex items-center space-x-3 group hover:text-indigo-900 dark:hover:text-indigo-100 transition duration-200"
                    title={`Toggle visibility for ${category}`}
                >
                    <CollapseIcon size={20} className="text-indigo-500 transition-transform group-hover:scale-110" />
                    <IconComponent 
                        name={categoryData.icon} 
                        className="text-purple-500 dark:text-purple-300 w-8 h-8" 
                        size={20}
                    />
                    <span>
                        {category} 
                        <span className="text-base font-normal opacity-80 ml-2">
                            ({categoryData.items.length} items)
                        </span>
                    </span>
                </button>
                
                {/* Category Actions */}
                {canManage && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onOpenEditCategory && onOpenEditCategory(category, categoryData.icon)}
                            className="p-1 rounded-full text-indigo-700 hover:bg-indigo-200/60 dark:text-indigo-200 dark:hover:bg-indigo-700/40 transition duration-200"
                            title={`Edit category ${category}`}
                        >
                            <FaPencilAlt size={14} />
                        </button>
                        {/* Category Delete Button */}
                        <button
                            onClick={() => onDeleteCategory(category, categoryData.items)}
                            className="p-1 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition duration-200"
                            title={`Delete all ${categoryData.items.length} items in category: ${category}`}
                        >
                            <FaTrash size={16} />
                        </button>
                    </div>
                )}
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
                            isEditMode={allowDrag}
                            canManage={canManage}
                            onDropItem={onDropItem}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
