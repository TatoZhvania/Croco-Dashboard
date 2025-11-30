import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Custom hook to manage category state and operations
 */
export const useCategoryManagement = (items, updateItem, canManage) => {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [categoryOrder, setCategoryOrder] = useState({});
  const [editingCategory, setEditingCategory] = useState(null); // { name, icon }

  // Load category order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('categoryOrder');
    if (savedOrder) {
      try {
        setCategoryOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse category order:', e);
      }
    }
  }, []);

  const toggleCollapse = useCallback((category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const handleOpenEditCategory = useCallback((name, icon, openLoginModal) => {
    if (!canManage) {
      openLoginModal();
      return;
    }
    setEditingCategory({ name, icon });
  }, [canManage]);

  const handleSaveCategoryEdits = useCallback(async ({ name, icon }) => {
    if (!editingCategory || !canManage) return;
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

    // If icon changed, update icon for all items in category
    const targetName = name || oldName;
    const affectedForIcon = items.filter(i => (i.category || 'Uncategorized') === targetName);
    const desiredIcon = icon && icon.trim() ? icon.trim() : 'Folder';
    const iconNeedsUpdate = editingCategory.icon !== desiredIcon || name !== oldName;
    if (iconNeedsUpdate) {
      for (const it of affectedForIcon) {
        await updateItem(it.id, { categoryIcon: desiredIcon });
      }
    }

    setEditingCategory(null);
  }, [canManage, editingCategory, items, updateItem]);

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

  return {
    collapsedCategories,
    categoryOrder,
    editingCategory,
    existingCategories,
    setCategoryOrder,
    toggleCollapse,
    handleOpenEditCategory,
    handleSaveCategoryEdits,
    setEditingCategory,
  };
};
