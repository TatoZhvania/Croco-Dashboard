import React, { useState, useCallback, useMemo } from 'react';
import { useDarkMode } from './hooks/useDarkMode.jsx';
import { useApiDashboardItems } from './hooks/useApiDashboardItems.jsx';

// Components
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
import { ErrorDisplay } from './components/common/ErrorDisplay.jsx';
import { Header } from './components/layout/Header.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { CategorySection } from './components/dashboard/CategorySection.jsx';
import { EmptyState } from './components/dashboard/EmptyState.jsx';
import { ItemFormModal } from './components/modals/ItemFormModal.jsx';
import { ConfirmationModal } from './components/modals/ConfirmationModal.jsx';
import { CategoryEditModal } from './components/modals/CategoryEditModal.jsx';

export default function App() {
  const [theme, toggleTheme] = useDarkMode();
  const {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    deleteAllItemsInCategory,
    fetchData
  } = useApiDashboardItems();

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // { name, icon }

  // Event Handlers
  const toggleCollapse = useCallback((category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const handleDeleteItemConfirmed = useCallback(async (itemId) => {
    await deleteItem(itemId);
    setItemToDelete(null);
  }, [deleteItem]);

  const handleDeleteCategoryConfirmed = useCallback(async (categoryName) => {
    await deleteAllItemsInCategory(categoryName);
    setCategoryToDelete(null);
  }, [deleteAllItemsInCategory]);

  const handleTriggerDeleteItem = useCallback((item) => {
    setItemToDelete(item);
  }, []);

  const handleTriggerDeleteCategory = useCallback((categoryName, items) => {
    setCategoryToDelete({ name: categoryName, items: items });
  }, []);

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Category edit handlers: rename and change icon
  const handleRenameCategory = useCallback(async (oldName, newName) => {
    // Move collapse state to the new key if present
    setCollapsedCategories(prev => {
      if (prev.hasOwnProperty(oldName)) {
        const { [oldName]: oldVal, ...rest } = prev;
        return { ...rest, [newName]: oldVal };
      }
      return prev;
    });

    const affectedItems = items.filter(i => {
      const cat = i.category || 'Uncategorized';
      return cat === oldName;
    });

    for (const it of affectedItems) {
      await updateItem(it.id, { category: newName });
    }
  }, [items, updateItem]);

  const handleChangeCategoryIcon = useCallback(async (categoryName, newIcon) => {
    const affectedItems = items.filter(i => {
      const cat = i.category || 'Uncategorized';
      return cat === categoryName;
    });

    for (const it of affectedItems) {
      await updateItem(it.id, { categoryIcon: newIcon });
    }
  }, [items, updateItem]);

  const handleAddNew = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // Open category edit modal
  const handleOpenEditCategory = useCallback((name, icon) => {
    setEditingCategory({ name, icon });
  }, []);

  // Save category edits (rename and/or icon change)
  const handleSaveCategoryEdits = useCallback(async ({ name, icon }) => {
    if (!editingCategory) return;
    const oldName = editingCategory.name;

    // If name changed, rename category
    if (name && name !== oldName) {
      await (async () => {
        // Move collapse state
        setCollapsedCategories(prev => {
          if (prev.hasOwnProperty(oldName)) {
            const { [oldName]: oldVal, ...rest } = prev;
            return { ...rest, [name]: oldVal };
          }
          return prev;
        });

        const affected = items.filter(i => (i.category || 'Uncategorized') === oldName);
        for (const it of affected) {
          await updateItem(it.id, { category: name });
        }
      })();
    }

    // If icon changed, update icon for all items in category (use new name if renamed)
    const targetName = name || oldName;
    const affectedForIcon = items.filter(i => (i.category || 'Uncategorized') === targetName);
    const desiredIcon = icon && icon.trim() ? icon.trim() : 'Folder';
    const iconNeedsUpdate = editingCategory.icon !== desiredIcon || name !== oldName; // update after rename to apply to moved items
    if (iconNeedsUpdate) {
      for (const it of affectedForIcon) {
        await updateItem(it.id, { categoryIcon: desiredIcon });
      }
    }

    setEditingCategory(null);
  }, [editingCategory, items, updateItem, setCollapsedCategories]);

  // Drag and Drop Logic
  const handleDropItem = useCallback(async (draggedItemId, targetItemId, targetCategory) => {
    const draggedItem = items.find(i => i.id === draggedItemId);
    const targetItem = items.find(i => i.id === targetItemId);
    if (!draggedItem || !targetItem) return;

    if (draggedItem.category !== targetCategory) {
      await updateItem(draggedItemId, {
        category: targetCategory,
        categoryIcon: targetItem.category_icon
      });
      return;
    }

    const currentCategoryItems = items
      .filter(i => i.category === targetCategory)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const draggedIndex = currentCategoryItems.findIndex(i => i.id === draggedItemId);
    const targetIndex = currentCategoryItems.findIndex(i => i.id === targetItemId);

    currentCategoryItems.splice(draggedIndex, 1);
    currentCategoryItems.splice(targetIndex, 0, draggedItem);

    let newOrderIndex;
    if (targetIndex === 0) {
      newOrderIndex = (currentCategoryItems[1]?.orderIndex || 0) - 1;
    } else if (targetIndex === currentCategoryItems.length - 1) {
      newOrderIndex = (currentCategoryItems[targetIndex - 1]?.orderIndex || 0) + 1;
    } else {
      const prevIndex = currentCategoryItems[targetIndex - 1]?.orderIndex || 0;
      const nextIndex = currentCategoryItems[targetIndex + 1]?.orderIndex || (prevIndex + 2);
      newOrderIndex = (prevIndex + nextIndex) / 2;
    }
    newOrderIndex = Math.max(0, newOrderIndex);

    await updateItem(draggedItemId, { orderIndex: newOrderIndex });
  }, [items, updateItem]);

  const handleCategoryDrop = useCallback((e, category, categoryData) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
    if (isEditMode) {
      const draggedItemId = e.dataTransfer.getData('text/plain');
      if (draggedItemId) {
        updateItem(draggedItemId, {
          category: category,
          categoryIcon: categoryData.icon,
          orderIndex: Date.now()
        });
      }
    }
  }, [isEditMode, updateItem]);

  const handleCategoryDragOver = useCallback((e) => {
    if (isEditMode && e.dataTransfer.types.includes('text/plain')) {
      e.currentTarget.classList.add('ring-4', 'ring-indigo-400');
      e.preventDefault();
    }
  }, [isEditMode]);

  const handleCategoryDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
  }, []);

  // Data Processing
  const filteredItems = useMemo(() =>
    items
      .filter(item => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return (
          (item.name || '').toLowerCase().includes(lowerCaseSearch) ||
          (item.description || '').toLowerCase().includes(lowerCaseSearch) ||
          (item.url || '').toLowerCase().includes(lowerCaseSearch) ||
          (item.category || '').toLowerCase().includes(lowerCaseSearch)
        );
      })
      .sort((a, b) => {
        const catA = a.category || 'Uncategorized';
        const catB = b.category || 'Uncategorized';
        if (catA < catB) return -1;
        if (catA > catB) return 1;
        return (a.orderIndex || 0) - (b.orderIndex || 0);
      }),
    [items, searchTerm]
  );

  const groupedData = useMemo(() =>
    filteredItems.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = {
          items: [],
          icon: item.category_icon || 'Folder'
        };
      }
      acc[cat].items.push(item);
      return acc;
    }, {}),
    [filteredItems]
  );

  const sortedCategories = useMemo(() =>
    Object.keys(groupedData).sort(),
    [groupedData]
  );

  const existingCategories = useMemo(() => {
    const categoryMap = new Map();
    items.forEach(item => {
      const catName = item.category || 'Uncategorized';
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, {
          name: catName,
          icon: item.category_icon || 'Folder'
        });
      }
    });
    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Render Logic
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 pb-6 sm:pb-8 font-sans transition-colors duration-300">
      {/* Header: ThemeToggle removed */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        items={items}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        onAddNew={handleAddNew}
      />

      <main>
        {filteredItems.length === 0 && items.length > 0 ? (
          <EmptyState type="search" searchTerm={searchTerm} />
        ) : filteredItems.length === 0 ? (
          <EmptyState type="empty" />
        ) : (
          <div className="space-y-6 md:space-y-8">
            {sortedCategories.map(category => (
              <CategorySection
                key={category}
                category={category}
                categoryData={groupedData[category]}
                isCollapsed={collapsedCategories[category] === true}
                isEditMode={isEditMode}
                onToggleCollapse={toggleCollapse}
                onDeleteCategory={handleTriggerDeleteCategory}
                onDeleteItem={handleTriggerDeleteItem}
                onEditItem={setEditingItem}
                onDropItem={handleDropItem}
                onCategoryDrop={(e) => handleCategoryDrop(e, category, groupedData[category])}
                onCategoryDragOver={handleCategoryDragOver}
                onCategoryDragLeave={handleCategoryDragLeave}
                onOpenEditCategory={handleOpenEditCategory}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer with ThemeToggle at bottom-left (fixed by default) */}
      <Footer theme={theme} toggleTheme={toggleTheme} fixed />

      {/* Modals */}
      {(showAddModal || editingItem) && (
        <ItemFormModal
          onSave={addItem}
          onUpdate={updateItem}
          itemToEdit={editingItem}
          existingCategories={existingCategories}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {itemToDelete && (
        <ConfirmationModal
          item={itemToDelete}
          onConfirm={handleDeleteItemConfirmed}
          onCancel={() => setItemToDelete(null)}
        />
      )}

      {categoryToDelete && (
        <ConfirmationModal
          type="category"
          categoryName={categoryToDelete.name}
          item={categoryToDelete.items}
          onConfirm={handleDeleteCategoryConfirmed}
          onCancel={() => setCategoryToDelete(null)}
        />
      )}

      
    {editingCategory && (
        <CategoryEditModal
          isOpen={!!editingCategory}
          initialName={editingCategory.name}
          initialIcon={editingCategory.icon}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveCategoryEdits}
        />
      )}

    </div>
  );
}