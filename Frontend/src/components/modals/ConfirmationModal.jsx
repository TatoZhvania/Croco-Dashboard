import React from 'react';
import * as lucide from 'lucide-react';

export const ConfirmationModal = ({ item, categoryName, onConfirm, onCancel, type = 'item' }) => {
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