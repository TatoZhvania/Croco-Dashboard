import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api.jsx';

export const useApiDashboardItems = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        let retries = 0;
        const maxRetries = 5;

        while (retries < maxRetries) {
            try {
                const response = await fetch(API_BASE_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                let data = await response.json();
                
                // Map database fields to React component fields
                data = data.map((item, index) => ({
                    ...item,
                    categoryIcon: item.category_icon || 'Folder',
                    secretKey: item.secret_key || '',
                    orderIndex: item.order_index !== undefined && item.order_index !== null ? item.order_index : index,
                }));

                setItems(data);
                setIsLoading(false);
                return;
            } catch (err) {
                retries += 1;
                console.warn(`Attempt ${retries} failed to fetch data. Retrying...`, err.message);
                if (retries === maxRetries) {
                    setError("Failed to connect to the Flask API after multiple attempts. Check backend status.");
                    setIsLoading(false);
                }
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addItem = useCallback(async (newItemData) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItemData),
            });
            if (!response.ok) throw new Error("Failed to add item to API.");
            fetchData();
        } catch (e) {
            console.error("Error adding item:", e);
            setError("Could not add item. API connection issue.");
        }
    }, [fetchData]);

    const updateItem = useCallback(async (itemId, updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error("Failed to update item via API.");
            fetchData();
        } catch (e) {
            console.error("Error updating item:", e);
            setError("Could not update item. API connection issue.");
        }
    }, [fetchData]);

    const deleteItem = useCallback(async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Failed to delete item via API.");
            fetchData();
        } catch (e) {
            console.error("Error deleting item:", e);
            setError("Could not delete item. API connection issue.");
        }
    }, [fetchData]);

    const deleteAllItemsInCategory = useCallback(async (categoryName) => {
        const itemsToDelete = items.filter(item => item.category === categoryName);
        if (itemsToDelete.length === 0) return;

        try {
            const deletePromises = itemsToDelete.map(item => 
                fetch(`${API_BASE_URL}/${item.id}`, { method: 'DELETE' })
            );

            const results = await Promise.allSettled(deletePromises);
            
            const failedDeletes = results.filter(r => r.status === 'rejected' || !r.value.ok);
            
            if (failedDeletes.length > 0) {
                 console.warn(`${failedDeletes.length} deletions failed.`);
            }

            fetchData();
        } catch (e) {
            console.error(`Error deleting category ${categoryName}:`, e);
            setError("Could not delete category items. API connection issue.");
        }
    }, [items, fetchData]);
    
    return { 
        items, 
        isLoading, 
        error, 
        addItem, 
        updateItem, 
        deleteItem, 
        deleteAllItemsInCategory,
        fetchData 
    };
};