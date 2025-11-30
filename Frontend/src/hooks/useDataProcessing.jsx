import { useMemo } from 'react';

/**
 * Custom hook to process and filter dashboard items
 */
export const useDataProcessing = (items, searchTerm, categoryOrder) => {
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

  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedData);
    
    // Sort by custom order if available, otherwise alphabetically
    return categories.sort((a, b) => {
      const orderA = categoryOrder[a];
      const orderB = categoryOrder[b];
      
      // If both have custom order, use it
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      
      // If only one has custom order, it comes first
      if (orderA !== undefined) return -1;
      if (orderB !== undefined) return 1;
      
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });
  }, [groupedData, categoryOrder]);

  return {
    filteredItems,
    groupedData,
    sortedCategories,
  };
};
