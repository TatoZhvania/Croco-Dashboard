import React from 'react';
import { IconComponent } from '../../utils/icons.jsx';
import { DashboardItem } from './DashboardItem.jsx';

// We'll use react-icons for the collapse and trash icons too
import { FaPencilAlt, FaChevronRight, FaChevronDown, FaTrash } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";

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
    onOpenEditCategory,
    onCategorySectionDragStart,
    onCategorySectionDragEnd,
    onCategorySectionDragOver,
    onCategorySectionDragLeave,
    onCategorySectionDrop
}) => {
    const CollapseIcon = isCollapsed ? FaChevronRight : FaChevronDown;
    const allowDrag = canManage && isEditMode;

    // Handle drag over for both category reordering and item drops
    const handleDragOver = (e) => {
        if (!allowDrag) return;
        
        // Only prevent default to allow drop, but don't prevent scrolling
        // Check if it's a category being dragged (for reordering)
        if (e.dataTransfer.types.includes('category/reorder')) {
            // Only prevent default when actually over the drop zone
            if (e.currentTarget.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
            e.currentTarget.classList.add('border-t-4', 'border-purple-500');
            onCategorySectionDragOver && onCategorySectionDragOver(e, category);
        }
        // Check if it's an item being dragged (for moving to this category)
        else if (e.dataTransfer.types.includes('text/plain')) {
            // Only prevent default when actually over the drop zone
            if (e.currentTarget.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
            e.currentTarget.classList.add('ring-4', 'ring-indigo-400');
            onCategoryDragOver && onCategoryDragOver(e);
        }
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('border-t-4', 'border-purple-500');
        e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
        onCategorySectionDragLeave && onCategorySectionDragLeave(e);
        onCategoryDragLeave && onCategoryDragLeave(e);
    };

    const handleDrop = (e) => {
        e.currentTarget.classList.remove('border-t-4', 'border-purple-500');
        e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
        
        // Check if it's a category being dropped (for reordering)
        if (e.dataTransfer.types.includes('category/reorder')) {
            onCategorySectionDrop && onCategorySectionDrop(e, category);
        }
        // Check if it's an item being dropped (for moving to this category)
        else if (e.dataTransfer.types.includes('text/plain')) {
            onCategoryDrop && onCategoryDrop(e, category, categoryData);
        }
    };

    return (
        <section 
            key={category}
            onDragOver={allowDrag ? handleDragOver : undefined}
            onDragLeave={allowDrag ? handleDragLeave : undefined}
            onDrop={allowDrag ? handleDrop : undefined}
            className={`rounded-xl transition-all duration-200 ${allowDrag ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
        >
            {/* Category Header */}
            <div className="flex justify-between items-center w-full p-4 mb-2 text-xl font-bold rounded-xl bg-indigo-500/10 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition duration-200 shadow-md">
                
                {/* Drag Handle (visible in edit mode) - ONLY THIS IS DRAGGABLE */}
                {allowDrag && (
                    <div 
                        draggable={true}
                        onDragStart={(e) => {
                            e.stopPropagation();
                            onCategorySectionDragStart(e, category);
                            // Add visual feedback
                            e.currentTarget.closest('section').style.opacity = '0.4';
                            e.currentTarget.closest('section').classList.add('border-4', 'border-dashed', 'border-purple-500');
                        }}
                        onDragEnd={(e) => {
                            e.stopPropagation();
                            onCategorySectionDragEnd(e);
                            // Remove visual feedback
                            e.currentTarget.closest('section').style.opacity = '1';
                            e.currentTarget.closest('section').classList.remove('border-4', 'border-dashed', 'border-purple-500');
                        }}
                        className="mr-2 text-gray-400 dark:text-gray-500 cursor-move hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                        title="Drag to reorder category"
                    >
                        <MdDragIndicator size={24} />
                    </div>
                )}
                
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

            {/* Collapsible Content with smooth height/opacity transition */}
            <div
                className={`transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 p-2">
                    {categoryData.items.map(item => {
                        // Map size to Tailwind col-span classes
                        // Using 8-column grid for better flexibility:
                        // extra-small: 1 col (1/8 width)
                        // small: 2 cols (1/4 width)
                        // medium: 4 cols (1/2 width)
                        // large: 6 cols (3/4 width)
                        // extra-large: 8 cols (full width)
                        const getSizeClass = (size) => {
                            switch(size) {
                                case 'extra-small': return 'col-span-1';
                                case 'small': return 'col-span-1 sm:col-span-2';
                                case 'medium': return 'col-span-2 sm:col-span-4';
                                case 'large': return 'col-span-2 sm:col-span-6';
                                case 'extra-large': return 'col-span-2 sm:col-span-8';
                                default: return 'col-span-2 sm:col-span-4'; // default to medium
                            }
                        };

                        return (
                            <div key={item.id} className={getSizeClass(item.size)}>
                                <DashboardItem
                                    item={item}
                                    onDelete={onDeleteItem}
                                    onEdit={onEditItem}
                                    isEditMode={allowDrag}
                                    canManage={canManage}
                                    onDropItem={onDropItem}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
