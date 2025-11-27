import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as lucide from 'lucide-react'; // Import all icons from lucide-react

// --- CONFIGURATION ---

// In a real Dockerized setup, the frontend accesses the backend via the 
// service name 'api' on port 5000. When running locally, localhost is used.
// Since this React app is also containerized, it can just use the service name.
const API_BASE_URL = window.location.hostname === 'localhost' ? 
                     'http://localhost:5000/api/items' : 
                     'http://api:5000/api/items';

// --- UTILITIES ---

// Utility function to copy text to clipboard
const copyToClipboard = (text, callback) => {
    try {
        // Use document.execCommand('copy') for better iframe compatibility
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (callback) callback();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};

// --- HOOKS ---

// Hook for Dark Mode
const useDarkMode = () => {
    const [theme, setTheme] = useState(() => {
        try {
            const localTheme = localStorage.getItem('theme');
            if (localTheme) return localTheme;
        } catch (error) { /* ignore */ }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const colorThemeToRemove = theme === 'dark' ? 'light' : 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(colorThemeToRemove);
        root.classList.add(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (error) { /* ignore */ }
    }, [theme, colorThemeToRemove]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return [theme, toggleTheme];
};


// Custom Hook for managing Dashboard Items via API
const useApiDashboardItems = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // In your fetchData function, add field mapping:
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
                    // Map category_icon (from DB) to categoryIcon (for React components)
                    categoryIcon: item.category_icon || 'Folder',
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
                // Exponential backoff delay
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }
    }, []);

    // Initial fetch
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
            fetchData(); // Refresh data from API
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
            fetchData(); // Refresh data from API
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
            fetchData(); // Refresh data from API
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

            fetchData(); // Refresh data to show remaining items
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


// --- UTILITY COMPONENTS ---

// Component for the Dark Mode Toggle
const ThemeToggle = ({ theme, toggleTheme }) => {
    const isDark = theme === 'dark';
    const Icon = isDark ? lucide.Sun : lucide.Moon;

    return (
        <button
            onClick={toggleTheme}
            className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
                isDark 
                    ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                    : 'bg-white text-indigo-600 hover:bg-gray-100'
            } border border-gray-200 dark:border-gray-700 transform hover:scale-105`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <Icon size={20} />
        </button>
    );
};


// Helper to render Lucide Icons dynamically
const IconComponent = ({ name, className }) => {
    // Default to Link if the icon name is invalid or empty
    const Icon = lucide[name] || lucide.Link; 
    return <Icon className={className} />;
};

// Component for the delete confirmation modal
const ConfirmationModal = ({ item, categoryName, onConfirm, onCancel, type = 'item' }) => {
    const isCategory = type === 'category';
    
    const title = isCategory ? `Delete Category: ${categoryName}` : 'Confirm Item Deletion';
    const itemCount = isCategory ? item.length : 1;
    const message = isCategory 
        ? `Are you sure you want to delete the entire category "${categoryName}"? This will permanently delete ALL ${itemCount} links associated with it. This action cannot be undone.`
        : `Are you sure you want to delete the item: ${item.name}? This action cannot be undone.`;
    const confirmText = isCategory ? `Delete All ${itemCount} Links` : 'Delete Permanently';

    return (
        <div className="fixed inset-0 bg-red-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-red-500">
                <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
                    <lucide.AlertTriangle size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    {message}
                </p>
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(isCategory ? categoryName : item.id)}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150 flex items-center"
                    >
                        <lucide.Trash2 size={18} className="mr-2" />
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};


// Component for a single dashboard item (the link box)
const DashboardItem = ({ item, onDelete, onEdit, isEditMode, onDropItem }) => {
    const { id, name, url, description, icon, username, secretKey } = item;
    const [copiedField, setCopiedField] = useState(null);

    // Reset copied status after a short delay
    useEffect(() => {
        if (copiedField) {
            const timer = setTimeout(() => setCopiedField(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [copiedField]);

    const handleClick = (e) => {
        if (isEditMode) {
            e.preventDefault(); // Prevent link opening in edit mode
            return;
        }
        try {
            const link = url.startsWith('http') ? url : `http://${url}`;
            window.open(link, '_blank');
        } catch (e) {
            console.error("Failed to open URL:", e);
        }
    };
    
    // Copy handler with feedback
    const handleCopy = (e, text, fieldName) => {
        e.stopPropagation();
        copyToClipboard(text, () => {
            setCopiedField(fieldName);
        });
    };
    
    const handleDragStart = (e) => {
        // Set the item ID being dragged
        e.dataTransfer.setData('text/plain', item.id);
        e.currentTarget.classList.add('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow drop
        if (isEditMode) {
             e.currentTarget.classList.add('shadow-xl', 'ring-2', 'ring-indigo-500');
        }
    };
    
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('shadow-xl', 'ring-2', 'ring-indigo-500');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('shadow-xl', 'ring-2', 'ring-indigo-500');
        if (isEditMode) {
            const draggedItemId = e.dataTransfer.getData('text/plain');
            const targetItemId = item.id;
            if (draggedItemId && draggedItemId !== targetItemId) {
                onDropItem(draggedItemId, targetItemId, item.category);
            }
        }
    };


    return (
        <div
            onClick={handleClick}
            draggable={isEditMode ? 'true' : 'false'}
            onDragStart={isEditMode ? handleDragStart : undefined}
            onDragEnd={isEditMode ? handleDragEnd : undefined}
            onDragOver={isEditMode ? handleDragOver : undefined}
            onDragLeave={isEditMode ? handleDragLeave : undefined}
            onDrop={isEditMode ? handleDrop : undefined}
            className={`group bg-white/50 dark:bg-gray-800/70 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-400 transition duration-300 cursor-pointer backdrop-blur-sm relative overflow-hidden flex flex-col justify-between
                ${isEditMode ? 'ring-2 ring-yellow-500 border-yellow-300 hover:shadow-yellow-500/50 cursor-move' : ''}
            `}
        >
            
            {/* Action Buttons Container (Edit/Delete) */}
            <div className="absolute top-2 right-2 flex space-x-1">
                {/* Edit Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the link
                        onEdit(item);
                    }}
                    className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                    title="Edit Item"
                >
                    <lucide.Edit size={16} />
                </button>

                {/* Delete Button - Triggers confirmation dialog */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent opening the link
                        onDelete(item); // Pass the entire item for confirmation modal
                    }}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                    title="Delete Item"
                >
                    <lucide.Trash2 size={16} />
                </button>
            </div>

            {/* Icon and Name */}
            <div className="flex items-center space-x-3 mb-3">
                <IconComponent name={icon} className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                    {name}
                </h3>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {description}
            </p>
            
            {/* Credential Actions */}
            {(username || secretKey) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 -mx-4 px-4 mt-auto">
                    {username && (
                        <button
                            onClick={(e) => handleCopy(e, username, 'username')}
                            className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center"
                            title="Copy Username to Clipboard"
                        >
                            {copiedField === 'username' ? (
                                <><lucide.Check size={14} className="mr-1" /> Copied!</>
                            ) : (
                                <><lucide.User size={14} className="mr-1" /> Copy User</>
                            )}
                        </button>
                    )}
                    {secretKey && (
                        <button
                            onClick={(e) => handleCopy(e, secretKey, 'secretKey')}
                            className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition flex items-center"
                            title="Copy Secret Key to Clipboard"
                        >
                            {copiedField === 'secretKey' ? (
                                <><lucide.Check size={14} className="mr-1" /> Copied!</>
                            ) : (
                                <><lucide.Key size={14} className="mr-1" /> Copy Secret</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* URL Tag */}
            <div className="flex justify-between items-center text-xs mt-3">
                <div className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full inline-block self-start">
                    {/* Safe URL parsing */}
                    {(url.startsWith('http://') || url.startsWith('https://')) 
                        ? (new URL(url).hostname || url)
                        : (url.includes('.') ? url.split('/')[0] : 'Link')}
                </div>
            </div>
        </div>
    );
};

// Component for the Add/Edit Item Modal/Form
const ItemFormModal = ({ onClose, itemToEdit, onSave, onUpdate, existingCategories }) => {
    // Initialize state based on the item being edited or default values
    const [name, setName] = useState(itemToEdit?.name || '');
    const [url, setUrl] = useState(itemToEdit?.url || '');
    const [description, setDescription] = useState(itemToEdit?.description || '');
    const [icon, setIcon] = useState(itemToEdit?.icon || 'Link');
    const [category, setCategory] = useState(itemToEdit?.category || '');
    const [categoryIcon, setCategoryIcon] = useState(itemToEdit?.categoryIcon || 'Folder');
    const [username, setUsername] = useState(itemToEdit?.username || '');
    const [secretKey, setSecretKey] = useState(itemToEdit?.secretKey || ''); 
    
    const [isSaving, setIsSaving] = useState(false);
    const [isExistingCategorySelected, setIsExistingCategorySelected] = useState(
        !!itemToEdit && existingCategories.some(c => c.name === itemToEdit.category)
    );
    
    const isEditMode = !!itemToEdit;

    // Update categoryIcon when an existing category is selected
    useEffect(() => {
        if (isExistingCategorySelected) {
            const selectedCat = existingCategories.find(c => c.name === category);
            if (selectedCat) {
                setCategoryIcon(selectedCat.icon);
            }
        }
    }, [category, isExistingCategorySelected, existingCategories]);

    const suggestedItemIcons = ['Home', 'GitBranch', 'Code', 'Server', 'FileText', 'Zap', 'Database', 'Mail'];
    const suggestedCategoryIcons = ['Folder', 'Tool', 'Server', 'Users', 'Trello', 'LayoutGrid'];

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'CREATE_NEW') {
            setIsExistingCategorySelected(false);
            setCategory('');
            setCategoryIcon('Folder');
        } else {
            setIsExistingCategorySelected(true);
            setCategory(value);
            // Icon update handled by useEffect
        }
    };


    const handleSave = async (e) => {
        e.preventDefault();
        if (!name || !url) {
            console.error("Required fields are missing (Name or URL).");
            return;
        }
        setIsSaving(true);

        const data = {
            name: name.trim(),
            url: url.trim(),
            description: description.trim(),
            icon: icon.trim() || 'Link',
            category: category.trim() || 'Uncategorized',
            categoryIcon: categoryIcon.trim() || 'Folder', 
            username: username.trim(),
            secretKey: secretKey.trim(),
            // Add or keep orderIndex. If adding, give a high index to put it last.
            orderIndex: itemToEdit?.orderIndex !== undefined ? itemToEdit.orderIndex : Date.now(),
        };

        try {
            if (isEditMode) {
                await onUpdate(itemToEdit.id, data);
            } else {
                await onSave(data);
            }
            onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} item:`, error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-2">
                    {isEditMode ? 'Edit Dashboard Item' : 'Add New Dashboard Item'}
                </h2>
                
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {/* Basic Fields */}
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Link Name</span>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">URL</span>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </label>
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Description</span>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="2"
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </label>

                    {/* Category Fields Block */}
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 space-y-3">
                        <div className="flex items-center text-purple-600 dark:text-purple-300 font-semibold mb-3">
                             <lucide.Tag size={20} className="mr-2" />
                             Category & Grouping
                        </div>
                        
                        <label className="block">
                             <span className="text-gray-700 dark:text-gray-300 font-medium mb-1 block">Category Selection</span>
                            <select 
                                value={isExistingCategorySelected ? category : 'CREATE_NEW'} 
                                onChange={handleCategoryChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="CREATE_NEW">-- Create New Category --</option>
                                {existingCategories.map((cat) => (
                                    <option key={cat.name} value={cat.name} className="flex items-center">
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {!isExistingCategorySelected && (
                            <label className="block">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">New Category Name</span>
                                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Choose or Create New..."
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </label>
                        )}
                        
                        {/* Category Icon Field - Only visible/editable for NEW or current category */}
                        {!isExistingCategorySelected && (
                            <label className="block">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Category Icon (Lucide Name)</span>
                                <input type="text" value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} placeholder="e.g., Folder, Tool, Server"
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Category Icon Preview: <IconComponent name={categoryIcon} className="w-5 h-5 inline-block text-purple-500 ml-1" />
                                    </p>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                        Suggestions: {suggestedCategoryIcons.join(', ')}
                                    </div>
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Item Icon Field */}
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Link Icon (Lucide-React)</span>
                        <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., Home, Settings, Code" required
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Link Icon Preview: <IconComponent name={icon} className="w-5 h-5 inline-block text-indigo-500 ml-1" />
                            </p>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                Suggestions: {suggestedItemIcons.join(', ')}
                            </div>
                        </div>
                    </label>
                    
                    {/* Credential Fields Block */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="flex items-center text-blue-600 dark:text-blue-300 font-semibold">
                             <lucide.Lock size={20} className="mr-2" />
                             Optional Login Hints
                        </div>
                        
                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Username (Optional)</span>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., *admin*"
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Secret Key / Password (Optional)</span>
                            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="e.g., *pass*"
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150" > Cancel </button>
                        <button type="submit" disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 flex items-center" >
                            {isSaving ? (
                                <> <lucide.Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving... </>
                            ) : (
                                <> <IconComponent name={isEditMode ? 'Save' : 'Plus'} size={20} className="mr-1" /> 
                                    {isEditMode ? 'Save Changes' : 'Add Item'} </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

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
    const [itemToDelete, setItemToDelete] = useState(null); // Used for single item deletion
    const [categoryToDelete, setCategoryToDelete] = useState(null); // Used for category deletion
    const [collapsedCategories, setCollapsedCategories] = useState({});
    
    // NEW STATE: Toggle for edit mode (reordering)
    const [isEditMode, setIsEditMode] = useState(false); 

    const toggleCollapse = useCallback((category) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    }, []);
    
    // Delete Functionality (Confirmed)
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
        setCategoryToDelete(null);
    }, []);

    const handleTriggerDeleteCategory = useCallback((categoryName, items) => {
        setCategoryToDelete({ name: categoryName, items: items });
        setItemToDelete(null);
    }, []);


    // --- Data Filtering and Grouping ---
    
    const filteredItems = items
        // 1. Filter by search term
        .filter(item => {
            const lowerCaseSearch = searchTerm.toLowerCase();
            return (
                (item.name || '').toLowerCase().includes(lowerCaseSearch) ||
                (item.description || '').toLowerCase().includes(lowerCaseSearch) ||
                (item.url || '').toLowerCase().includes(lowerCaseSearch) ||
                (item.category || '').toLowerCase().includes(lowerCaseSearch)
            );
        })
        // 2. Sort the filtered items by category name and then by orderIndex
        .sort((a, b) => {
            const catA = a.category || 'Uncategorized';
            const catB = b.category || 'Uncategorized';
            if (catA < catB) return -1;
            if (catA > catB) return 1;
            // Within the same category, sort by orderIndex
            return (a.orderIndex || 0) - (b.orderIndex || 0);
        });

    // Group filtered items and also map the unique category icon
    // Group filtered items and also map the unique category icon
    const groupedData = filteredItems.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) {
            acc[cat] = {
                items: [],
                icon: item.category_icon || 'Folder'  // Change categoryIcon to category_icon
            };
        }
        acc[cat].items.push(item);
        return acc;
    }, {});
    
    const sortedCategories = Object.keys(groupedData).sort();
    
    // Extract unique categories for the Add/Edit Modal (Memoized for efficiency)
    // Extract unique categories for the Add/Edit Modal (Memoized for efficiency)
    const existingCategories = useMemo(() => {
        // Use a map to track unique categories and their icons
        const categoryMap = new Map();
        items.forEach(item => {
            const catName = item.category || 'Uncategorized';
            if (!categoryMap.has(catName)) {
                categoryMap.set(catName, {
                    name: catName,
                    icon: item.category_icon || 'Folder'  // Change categoryIcon to category_icon
                });
            }
        });
        return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [items]);

    // --- Drag and Drop Logic ---

    // Function to handle the drop event for reordering/re-categorizing items
    const handleDropItem = useCallback(async (draggedItemId, targetItemId, targetCategory) => {
        // 1. Identify the dragged and target items
        const draggedItem = items.find(i => i.id === draggedItemId);
        const targetItem = items.find(i => i.id === targetItemId);

        if (!draggedItem || !targetItem) return;

        // Ensure we are working with the same category/group of items
        const currentCategoryItems = items.filter(i => i.category === targetCategory).sort((a, b) => a.orderIndex - b.orderIndex);
        
        // Find the index positions in the current category list
        const draggedIndex = currentCategoryItems.findIndex(i => i.id === draggedItemId);
        const targetIndex = currentCategoryItems.findIndex(i => i.id === targetItemId);
        
        // If target item is in a different category, update the category first
        if (draggedItem.category !== targetCategory) {
            // First, update the dragged item's category to the new one
            await updateItem(draggedItemId, {
                category: targetCategory,
                categoryIcon: targetItem.category_icon // Change categoryIcon to category_icon
            });
            // The next re-indexing will happen on the next render cycle after updateItem/fetchData
            // To ensure smooth re-indexing, we force a refresh here and rely on the next cycle's sort.
            // For now, we return, and let the fetchData in updateItem handle the full refresh.
            return;
        }

        // --- Reordering Logic (Same Category) ---
        
        // Remove the dragged item from its current position in the array
        currentCategoryItems.splice(draggedIndex, 1);
        // Insert it at the target position
        currentCategoryItems.splice(targetIndex, 0, draggedItem);

        // Batch update to re-index all affected items (a simple 1, 2, 3... re-index)
        const updatePromises = currentCategoryItems.map((item, index) => {
            // Only update if index has actually changed
            if (item.orderIndex !== index) {
                return updateItem(item.id, { orderIndex: index });
            }
            return Promise.resolve();
        });

        // Execute all updates. fetchData() is called inside updateItem, but since we are
        // batching, we will call it manually for the final state coherence if we had a single update method.
        // Since updateItem currently calls fetchData(), the UI will update after the first update.
        // For simplicity and coherence in a single-file app, we'll execute them sequentially/with Promise.allSettled
        // and rely on the last call to fetchData to update the state, but we will call updateItem only for the main
        // reordering, and updateItem will handle the refresh. We just need to make sure the orderIndex is correct.

        // We only need to update the dragged item's orderIndex relative to its new neighbors.
        // Since the current API doesn't support batch writes, the simplest robust approach is to
        // just update the dragged item's orderIndex to be the average of its new neighbors.
        
        let newOrderIndex;
        if (targetIndex === 0) {
            // Placed first
            newOrderIndex = (currentCategoryItems[1]?.orderIndex || 0) - 1;
        } else if (targetIndex === currentCategoryItems.length - 1) {
            // Placed last
            newOrderIndex = (currentCategoryItems[targetIndex - 1]?.orderIndex || 0) + 1;
        } else {
            // Placed in the middle
            const prevIndex = currentCategoryItems[targetIndex - 1]?.orderIndex || 0;
            const nextIndex = currentCategoryItems[targetIndex + 1]?.orderIndex || (prevIndex + 2); // Fallback logic
            newOrderIndex = (prevIndex + nextIndex) / 2;
        }
        
        // Fallback to integer if decimal math creates issues (e.g., if targetIndex is 0)
        newOrderIndex = Math.max(0, newOrderIndex); 
        
        await updateItem(draggedItemId, { orderIndex: newOrderIndex });
        
    }, [items, updateItem]);

    // --- UI RENDER LOGIC ---

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <lucide.Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading Data from Flask API...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-950 p-6">
                <lucide.WifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
                <h2 className="mt-4 text-2xl font-bold text-red-800 dark:text-red-300">Connection Error</h2>
                <p className="mt-2 text-center text-red-700 dark:text-red-400">
                    {error}
                </p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150 flex items-center"
                >
                    <lucide.RotateCw size={18} className="mr-2" />
                    Try Reconnecting
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 font-sans transition-colors duration-300">
            
            {/* Header, Search, and Controls (Updated Layout) */}
            <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row justify-between items-center mb-4 space-y-4 lg:space-y-0">
                    
                    {/* Left Section: Title and Status */}
                    <div className="w-full lg:w-1/4 mb-4 lg:mb-0 text-center lg:text-left">
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start">
                            <lucide.HardHat className="w-6 h-6 mr-2 text-indigo-500" />
                            DevOps Dashboard
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {items.length} total links saved.
                        </p>
                    </div>

                    {/* Middle Section: Search Bar (Centered and Medium) */}
                    <div className="relative w-full max-w-2xl lg:w-1/2">
                        <lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search links by name, URL, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-200"
                        />
                    </div>

                    {/* Right Section: Controls */}
                    <div className="w-full lg:w-1/4 flex justify-center lg:justify-end space-x-3">
                        
                        {/* Theme Toggle Button */}
                        {/* <ThemeToggle theme={theme} toggleTheme={toggleTheme} /> */}
                        
                        {/* NEW: Edit Mode Toggle Button */}
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
                                isEditMode
                                    ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                                    : 'bg-white dark:bg-gray-800 text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            } border border-gray-200 dark:border-gray-700 transform hover:scale-105`}
                            title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode (Reorder Links)'}
                        >
                            <lucide.Pencil size={20} />
                        </button>

                        {/* Add Button */}
                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setShowAddModal(true);
                            }}
                            className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02] flex items-center group min-w-[150px]"
                        >
                            <lucide.Plus size={20} className="mr-2 group-hover:rotate-90 transition duration-300" />
                            Add New Link
                        </button>
                    </div>
                </div>
                {isEditMode && (
                    <div className="text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
                        <lucide.Move size={18} className="inline mr-2" />
                        EDIT MODE IS ACTIVE: Drag and drop links to reorder or move them between categories.
                    </div>
                )}
            </header>

            {/* Dashboard Grid (Grouped by Category) */}
            <main>
                {filteredItems.length === 0 && items.length > 0 ? (
                    <div className="text-center p-10 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <lucide.Filter size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
                        <h2 className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">No results found for "{searchTerm}"</h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-500">
                            Try adjusting your search query or clear the search to see all items.
                        </p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center p-10 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <lucide.Frown size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
                        <h2 className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">No Dashboard Items Yet</h2>
                        <p className="mt-1 text-gray-500 dark:text-gray-500">
                            Click "Add New Link" to start building your personalized, persistent dashboard.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 md:space-y-8">
                        {sortedCategories.map(category => {
                            const categoryData = groupedData[category];
                            const isCollapsed = collapsedCategories[category] === true; 
                            const Icon = isCollapsed ? lucide.ChevronRight : lucide.ChevronDown;
                            const CategoryIcon = lucide[categoryData.icon] || lucide.Folder;

                            const handleCategoryDrop = (e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
                                if (isEditMode) {
                                    const draggedItemId = e.dataTransfer.getData('text/plain');
                                    if (draggedItemId) {
                                        // Move to this category, then set the order index to be last
                                        updateItem(draggedItemId, { 
                                            category: category, 
                                            categoryIcon: categoryData.icon,
                                            orderIndex: Date.now() 
                                        });
                                    }
                                }
                            };
                            
                            const handleCategoryDragOver = (e) => {
                                e.preventDefault();
                                if (isEditMode && e.dataTransfer.types.includes('text/plain')) {
                                    e.currentTarget.classList.add('ring-4', 'ring-indigo-400');
                                }
                            };

                            const handleCategoryDragLeave = (e) => {
                                e.currentTarget.classList.remove('ring-4', 'ring-indigo-400');
                            };


                            return (
                                <section 
                                    key={category} 
                                    onDrop={isEditMode ? handleCategoryDrop : undefined}
                                    onDragOver={isEditMode ? handleCategoryDragOver : undefined}
                                    onDragLeave={isEditMode ? handleCategoryDragLeave : undefined}
                                    className={`rounded-xl transition duration-200 ${isEditMode ? 'border border-dashed border-indigo-500' : ''}`}
                                >
                                    {/* Category Header (Accordion Toggle) */}
                                    <div className="flex justify-between items-center w-full p-4 mb-2 text-xl font-bold rounded-xl bg-indigo-500/10 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition duration-200 shadow-md">
                                        
                                        {/* Category Title and Collapse Button */}
                                        <button
                                            onClick={() => toggleCollapse(category)}
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
                                            onClick={() => handleTriggerDeleteCategory(category, categoryData.items)}
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
                                                    onDelete={handleTriggerDeleteItem}
                                                    onEdit={setEditingItem}
                                                    isEditMode={isEditMode}
                                                    onDropItem={handleDropItem}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modals */}
            {(showAddModal || editingItem) && (
                <ItemFormModal
                    onSave={addItem}
                    onUpdate={updateItem}
                    itemToEdit={editingItem}
                    existingCategories={existingCategories} // Pass existing categories
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                    }}
                />
            )}
            
            {/* Single Item Deletion Modal */}
            {itemToDelete && (
                <ConfirmationModal
                    item={itemToDelete}
                    onConfirm={handleDeleteItemConfirmed}
                    onCancel={() => setItemToDelete(null)}
                />
            )}

            {/* Category Deletion Modal */}
            {categoryToDelete && (
                <ConfirmationModal
                    categoryName={categoryToDelete.name}
                    item={categoryToDelete.items} // Pass the list of items for count
                    type="category"
                    onConfirm={handleDeleteCategoryConfirmed}
                    onCancel={() => setCategoryToDelete(null)}
                />
            )}
        </div>
    );
}