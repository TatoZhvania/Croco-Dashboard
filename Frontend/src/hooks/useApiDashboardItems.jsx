import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_IMPORT_URL, API_EXPORT_URL } from '../config/api.jsx';

export const useApiDashboardItems = (authToken = '') => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeaders = useCallback(() => (
        authToken
            ? { Authorization: `Bearer ${authToken}` }
            : {}
    ), [authToken]);

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

    const mutationHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        ...authHeaders()
    }), [authHeaders]);

    const addItem = useCallback(async (newItemData) => {
        try {
            await axios.post(API_BASE_URL, newItemData, {
                headers: mutationHeaders()
            });
            fetchData();
        } catch (err) {
            console.error("Error adding item:", err);
            const message = err?.response?.status === 401
                ? "Admin access required to add items."
                : "Could not add item. API connection issue.";
            setError(message);
        }
    }, [fetchData, mutationHeaders]);

    const updateItem = useCallback(async (itemId, updatedData) => {
        try {
            console.log('[API] Updating item', { itemId, updatedData });
            await axios.put(`${API_BASE_URL}/${itemId}`, updatedData, {
                headers: mutationHeaders()
            });
            console.log('[API] Update success', { itemId });
            fetchData();
        } catch (err) {
            console.error("Error updating item:", err);
            const message = err?.response?.status === 401
                ? "Admin access required to update items."
                : "Could not update item. API connection issue.";
            setError(message);
        }
    }, [fetchData, mutationHeaders]);

    const deleteItem = useCallback(async (itemId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${itemId}`, {
                headers: mutationHeaders()
            });
            fetchData();
        } catch (err) {
            console.error("Error deleting item:", err);
            const message = err?.response?.status === 401
                ? "Admin access required to delete items."
                : "Could not delete item. API connection issue.";
            setError(message);
        }
    }, [fetchData, mutationHeaders]);

    const deleteAllItemsInCategory = useCallback(async (categoryName) => {
        const itemsToDelete = items.filter(item => item.category === categoryName);
        if (itemsToDelete.length === 0) return;

        try {
            const deletePromises = itemsToDelete.map(item => 
                axios.delete(`${API_BASE_URL}/${item.id}`, {
                    headers: mutationHeaders()
                })
            );

            const results = await Promise.allSettled(deletePromises);
            
            const failedDeletes = results.filter(r => r.status === 'rejected');
            
            if (failedDeletes.length > 0) {
                 console.warn(`${failedDeletes.length} deletions failed.`);
            }

            fetchData();
        } catch (err) {
            console.error(`Error deleting category ${categoryName}:`, err);
            const message = err?.response?.status === 401
                ? "Admin access required to delete categories."
                : "Could not delete category items. API connection issue.";
            setError(message);
        }
    }, [items, fetchData, mutationHeaders]);

    const importItems = useCallback(async (itemsPayload, replaceExisting = false) => {
        try {
            await axios.post(API_IMPORT_URL, { items: itemsPayload, replaceExisting }, {
                headers: mutationHeaders()
            });
            fetchData();
            return true;
        } catch (err) {
            console.error("Error importing items:", err);
            const message = err?.response?.status === 401
                ? "Admin access required to import items."
                : "Could not import items. Check JSON and API connection.";
            setError(message);
            return false;
        }
    }, [fetchData, mutationHeaders]);

    const exportItems = useCallback(async () => {
        try {
            const response = await axios.get(API_EXPORT_URL, {
                headers: authHeaders()
            });
            return response.data;
        } catch (err) {
            console.error("Error exporting items:", err);
            const message = err?.response?.status === 401
                ? "Admin access required to export items."
                : "Could not export items. API connection issue.";
            setError(message);
            return null;
        }
    }, [authHeaders, setError]);
    
    return { 
        items, 
        isLoading, 
        error, 
        addItem, 
        updateItem, 
        deleteItem, 
        deleteAllItemsInCategory,
        fetchData,
        importItems,
        exportItems
    };
};
