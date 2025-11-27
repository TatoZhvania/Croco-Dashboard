import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
                const response = await axios.get(API_BASE_URL);
                
                // Map database fields to React component fields
                const data = response.data.map((item, index) => ({
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
            await axios.post(API_BASE_URL, newItemData, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchData();
        } catch (err) {
            console.error("Error adding item:", err);
            setError("Could not add item. API connection issue.");
        }
    }, [fetchData]);

    const updateItem = useCallback(async (itemId, updatedData) => {
        try {
            console.log('[API] Updating item', { itemId, updatedData });
            await axios.put(`${API_BASE_URL}/${itemId}`, updatedData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('[API] Update success', { itemId });
            fetchData();
        } catch (err) {
            console.error("Error updating item:", err);
            setError("Could not update item. API connection issue.");
        }
    }, [fetchData]);

    const deleteItem = useCallback(async (itemId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${itemId}`);
            fetchData();
        } catch (err) {
            console.error("Error deleting item:", err);
            setError("Could not delete item. API connection issue.");
        }
    }, [fetchData]);

    const deleteAllItemsInCategory = useCallback(async (categoryName) => {
        const itemsToDelete = items.filter(item => item.category === categoryName);
        if (itemsToDelete.length === 0) return;

        try {
            const deletePromises = itemsToDelete.map(item => 
                axios.delete(`${API_BASE_URL}/${item.id}`)
            );

            const results = await Promise.allSettled(deletePromises);
            
            const failedDeletes = results.filter(r => r.status === 'rejected');
            
            if (failedDeletes.length > 0) {
                 console.warn(`${failedDeletes.length} deletions failed.`);
            }

            fetchData();
        } catch (err) {
            console.error(`Error deleting category ${categoryName}:`, err);
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