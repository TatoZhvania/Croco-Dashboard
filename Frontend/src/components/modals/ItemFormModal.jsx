import React, { useState, useEffect } from 'react';
import { IconComponent } from '../../utils/icons.jsx'; // Only import from utils
import { ENVIRONMENT_OPTIONS, ENVIRONMENTS } from '../../utils/environments.jsx';
import { FaTag, FaEyeSlash } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { RiLoader2Fill } from "react-icons/ri";

export const ItemFormModal = ({ onClose, itemToEdit, onSave, onUpdate, existingCategories, isAdmin }) => {
    const [name, setName] = useState(itemToEdit?.name || '');
    const [url, setUrl] = useState(itemToEdit?.url || '');
    const [description, setDescription] = useState(itemToEdit?.description || '');
    const [icon, setIcon] = useState(itemToEdit?.icon || 'Link');
    const [category, setCategory] = useState(itemToEdit?.category || '');
    const [categoryIcon, setCategoryIcon] = useState(itemToEdit?.categoryIcon || 'Folder');
    const [username, setUsername] = useState(itemToEdit?.username || '');
    const [secretKey, setSecretKey] = useState(itemToEdit?.secretKey || '');
    const [isAdminOnly, setIsAdminOnly] = useState(itemToEdit?.isAdminOnly || itemToEdit?.is_admin_only || false);
    const [size, setSize] = useState(itemToEdit?.size || 'medium');
    const [environment, setEnvironment] = useState(itemToEdit?.environment || ENVIRONMENTS.COMMON); 
    
    const [isSaving, setIsSaving] = useState(false);
    const [isExistingCategorySelected, setIsExistingCategorySelected] = useState(
        !!itemToEdit && existingCategories.some(c => c.name === itemToEdit.category)
    );
    
    const isEditMode = !!itemToEdit;

    useEffect(() => {
        if (isExistingCategorySelected) {
            const selectedCat = existingCategories.find(c => c.name === category);
            if (selectedCat) {
                setCategoryIcon(selectedCat.icon);
            }
        }
    }, [category, isExistingCategorySelected, existingCategories]);

    const suggestedItemIcons = ['Argo', 'Docker', 'Grafana',];

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'CREATE_NEW') {
            setIsExistingCategorySelected(false);
            setCategory('');
            setCategoryIcon('Folder');
        } else {
            setIsExistingCategorySelected(true);
            setCategory(value);
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
            icon: icon.trim() || 'GitHub',
            category: category.trim() || 'Uncategorized',
            categoryIcon: categoryIcon.trim() || 'Folder',
            username: username.trim(),
            secretKey: secretKey.trim(),
            orderIndex: itemToEdit?.orderIndex !== undefined ? itemToEdit.orderIndex : Date.now(),
            isAdminOnly: isAdminOnly,
            size: size,
            environment: environment,
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

    const handleBackdropClick = (e) => {
        // Only close if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
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
                             <FaTag size={20} className="mr-2" />
                             Category & Grouping
                        </div>
                        
                        <label className="block">
                             <span className="text-gray-700 dark:text-gray-300 font-medium mb-1 block">Category Selection</span>
                            <select 
                                value={isExistingCategorySelected ? category : 'CREATE_NEW'} 
                                onChange={handleCategoryChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="CREATE_NEW">-- Create Category or Choose --</option>
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
                                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Tools, Social"
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </label>
                        )}
                        
                        {!isExistingCategorySelected && (
                            <label className="block">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Category Icon</span>
                                <input type="text" value={categoryIcon} onChange={(e) => setCategoryIcon(e.target.value)} placeholder="Icon Name..."
                                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Category Icon Preview: <IconComponent name={categoryIcon} className="w-5 h-5 inline-block text-purple-500 ml-1" size={20} />
                                    </p>
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Item Icon Field */}
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Link Icon</span>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="Icon Name..."
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Current Icon Preview: <IconComponent name={icon} className="w-5 h-5 inline-block text-indigo-500 ml-1" size={20} />
                            </p>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                Try: {suggestedItemIcons.join(', ')}
                            </div>
                        </div>
                    </label>
                    
                    {/* Box Size Selector */}
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Box Size</span>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="extra-small">Extra Small (Compact)</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large (Full Width)</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Choose the display size for this item card
                        </p>
                    </label>
                    
                    {/* Environment Selection */}
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Environment</span>
                        <select
                            value={environment}
                            onChange={(e) => setEnvironment(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {ENVIRONMENT_OPTIONS.map(env => (
                                <option key={env.value} value={env.value}>
                                    {env.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Choose the environment for this item
                        </p>
                    </label>
                    
                    {/* Credential Fields Block */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-3">
                        <div className="flex items-center text-blue-600 dark:text-blue-300 font-semibold">
                             <FaLock size={20} className="mr-2" />
                             Optional Login Hints
                        </div>
                        
                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Username (Optional)</span>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., admin"
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Password (Optional)</span>
                            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="e.g., admin123"
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </label>
                    </div>

                    {/* Admin Only Visibility Setting */}
                    {isAdmin && (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-amber-600 dark:text-amber-300 font-semibold">
                                    <FaEyeSlash size={20} className="mr-2" />
                                    Visibility Settings
                                </div>
                            </div>
                            <label className="flex items-center mt-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={isAdminOnly}
                                    onChange={(e) => setIsAdminOnly(e.target.checked)}
                                    className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                />
                                <span className="ml-3 text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-200">
                                    <strong>Admin Only</strong> - Only visible to administrators
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">
                                When enabled, this item and its category will be hidden from non-admin users
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150" > Cancel </button>
                        <button type="submit" disabled={isSaving}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50 flex items-center" >
                            {isSaving ? (
                                <> <RiLoader2Fill className="w-4 h-4 mr-2 animate-spin" /> Saving... </>
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