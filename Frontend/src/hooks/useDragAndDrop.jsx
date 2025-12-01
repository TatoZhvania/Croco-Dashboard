import { useCallback } from 'react';

/**
 * Custom hook to manage all drag-and-drop operations for items and categories
 */
export const useDragAndDrop = (items, updateItem, activeEditMode, setPendingMove) => {
  // Item Drag and Drop (within/between categories)
  const handleDropItem = useCallback(async (draggedItemId, targetItemId, targetCategory) => {
    if (!activeEditMode) return;
    const sameId = (item, id) => String(item.id) === String(id);

    // Normalize ids because drag data comes back as strings
    const draggedItem = items.find(i => sameId(i, draggedItemId));
    const targetItem = items.find(i => sameId(i, targetItemId));
    if (!draggedItem || !targetItem) {
      console.warn('[DragDrop] Items not found', { draggedItemId, targetItemId });
      return;
    }

    const resolvedCategory = targetCategory ?? targetItem.category ?? '';
    console.log('[DragDrop] drop event detected', {
      draggedItemId,
      targetItemId,
      resolvedCategory,
      draggedCategory: draggedItem.category
    });

    // CROSS-CATEGORY MOVE
    if (draggedItem.category !== resolvedCategory) {
      const fromCategory = draggedItem.category || '';
      const fromCount = items.filter(i => (i.category || '') === fromCategory).length;
      const updates = {
        category: resolvedCategory,
        categoryIcon: targetItem.category_icon
      };

      if (fromCount <= 1) {
        setPendingMove({
          itemId: draggedItemId,
          fromCategory,
          toCategory: resolvedCategory,
          updates
        });
        return;
      }

      console.log('[DragDrop] moving item between categories', {
        from: draggedItem.category,
        to: resolvedCategory
      });
      await updateItem(draggedItemId, {
        category: resolvedCategory,
        categoryIcon: targetItem.category_icon
      });
      return;
    }

    // SAME CATEGORY REORDERING
    const currentCategoryItems = items
      .filter(i => i.category === resolvedCategory)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const draggedIndex = currentCategoryItems.findIndex(i => sameId(i, draggedItemId));
    const targetIndex = currentCategoryItems.findIndex(i => sameId(i, targetItemId));
    
    if (draggedIndex === -1 || targetIndex === -1) {
      console.warn('[DragDrop] Item indices not found in category', { draggedIndex, targetIndex, draggedItemId, targetItemId });
      return;
    }

    if (draggedIndex === targetIndex) {
      console.log('[DragDrop] Item dropped on itself, skipping update');
      return;
    }

    currentCategoryItems.splice(draggedIndex, 1);
    currentCategoryItems.splice(targetIndex, 0, draggedItem);

    // Compute a new order index between neighbors to avoid full resequencing
    const prevOrder = currentCategoryItems[targetIndex - 1]?.orderIndex;
    const nextOrder = currentCategoryItems[targetIndex + 1]?.orderIndex;

    let newOrderIndex;
    if (targetIndex === 0) {
      newOrderIndex = (nextOrder ?? 0) - 1;
    } else if (targetIndex === currentCategoryItems.length - 1) {
      newOrderIndex = (prevOrder ?? 0) + 1;
    } else {
      const prevVal = prevOrder ?? 0;
      const nextVal = nextOrder ?? prevVal + 1;
      newOrderIndex = (prevVal + nextVal) / 2;
    }

    console.log('[DragDrop] reordering within category', {
      draggedId: draggedItemId,
      targetId: targetItemId,
      draggedIndex,
      targetIndex,
      prevOrder,
      nextOrder,
      newOrderIndex,
      currentDraggedOrderIndex: draggedItem.orderIndex
    });

    await updateItem(draggedItemId, { orderIndex: newOrderIndex });
  }, [activeEditMode, items, updateItem, setPendingMove]);

  const handleCategoryDrop = useCallback((e, category, categoryData) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
    if (activeEditMode) {
      const draggedItemId = e.dataTransfer.getData('text/plain');
      if (draggedItemId) {
        const draggedItem = items.find(i => String(i.id) === String(draggedItemId));
        if (!draggedItem) {
          console.warn('[CategoryDrop] Dragged item not found', draggedItemId);
          return;
        }

        const fromCategory = draggedItem.category || '';
        if (fromCategory === category) {
          console.log('[CategoryDrop] Ignoring drop within same category', {
            draggedItemId,
            category
          });
          return;
        }

        const fromCount = items.filter(i => (i.category || '') === fromCategory).length;
        const updates = {
          category: category,
          categoryIcon: categoryData.icon,
          orderIndex: Date.now()
        };

        if (fromCount <= 1) {
          setPendingMove({
            itemId: draggedItemId,
            fromCategory,
            toCategory: category,
            updates
          });
          return;
        }

        console.log('[CategoryDrop] Moving item between categories', {
          draggedItemId,
          from: fromCategory,
          to: category
        });

        updateItem(draggedItemId, updates);
      }
    }
  }, [activeEditMode, items, updateItem, setPendingMove]);

  const handleCategoryDragOver = useCallback((e) => {
    if (activeEditMode && e.dataTransfer.types.includes('text/plain')) {
      e.currentTarget.classList.add('ring-4', 'ring-indigo-400');
      // Prevent default to allow drop but don't stop propagation to allow scrolling
      e.preventDefault();
    }
  }, [activeEditMode]);

  const handleCategoryDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
  }, []);

  // Category Section Drag and Drop for Reordering
  const handleCategorySectionDragStart = useCallback((e, category) => {
    if (!activeEditMode) return;
    e.dataTransfer.setData('category/reorder', category);
    e.currentTarget.style.opacity = '0.4';
    
    // Enable auto-scrolling during drag
    let scrollInterval;
    const autoScroll = (event) => {
      const scrollSpeed = 10;
      const scrollZone = 100; // pixels from edge to trigger scroll
      const windowHeight = window.innerHeight;
      const mouseY = event.clientY;
      
      if (mouseY < scrollZone) {
        // Scroll up
        window.scrollBy(0, -scrollSpeed);
      } else if (mouseY > windowHeight - scrollZone) {
        // Scroll down
        window.scrollBy(0, scrollSpeed);
      }
    };
    
    // Set up scroll interval
    const dragHandler = (event) => {
      autoScroll(event);
    };
    
    document.addEventListener('drag', dragHandler);
    
    // Clean up on drag end
    const cleanup = () => {
      document.removeEventListener('drag', dragHandler);
      document.removeEventListener('dragend', cleanup);
    };
    document.addEventListener('dragend', cleanup);
  }, [activeEditMode]);

  const handleCategorySectionDragEnd = useCallback((e) => {
    e.currentTarget.style.opacity = '1';
  }, []);

  const handleCategorySectionDragOver = useCallback((e, category) => {
    if (!activeEditMode) return;
    const draggedCategory = e.dataTransfer.types.includes('category/reorder');
    if (draggedCategory) {
      // Only prevent default to enable drop, but allow the event to bubble for scrolling
      e.preventDefault();
      e.currentTarget.classList.add('border-t-4', 'border-purple-500');
    }
  }, [activeEditMode]);

  const handleCategorySectionDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove('border-t-4', 'border-purple-500');
  }, []);

  const handleCategorySectionDrop = useCallback((e, targetCategory, items, setCategoryOrder) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-t-4', 'border-purple-500');
    
    if (!activeEditMode) return;
    
    const draggedCategory = e.dataTransfer.getData('category/reorder');
    if (!draggedCategory || draggedCategory === targetCategory) return;

    setCategoryOrder(prev => {
      const categories = [...new Set(items.map(item => item.category || 'Uncategorized'))];
      const currentOrder = { ...prev };
      
      categories.forEach((cat, idx) => {
        if (currentOrder[cat] === undefined) {
          currentOrder[cat] = idx;
        }
      });

      const draggedOrder = currentOrder[draggedCategory];
      const targetOrder = currentOrder[targetCategory];

      const newOrder = { ...currentOrder };
      newOrder[draggedCategory] = targetOrder;
      newOrder[targetCategory] = draggedOrder;

      localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
      
      return newOrder;
    });
  }, [activeEditMode]);

  return {
    handleDropItem,
    handleCategoryDrop,
    handleCategoryDragOver,
    handleCategoryDragLeave,
    handleCategorySectionDragStart,
    handleCategorySectionDragEnd,
    handleCategorySectionDragOver,
    handleCategorySectionDragLeave,
    handleCategorySectionDrop,
  };
};
