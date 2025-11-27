import React, { useState, useEffect } from 'react';
import { IconComponent } from '../../utils/icons.jsx';
import { copyToClipboard } from '../../utils/clipboard.jsx';
import { FaRegEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa";


export const DashboardItem = ({ item, onDelete, onEdit, isEditMode, onDropItem }) => {
    const { id, name, url, description, icon, username, secretKey } = item;
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        if (copiedField) {
            const timer = setTimeout(() => setCopiedField(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [copiedField]);

    const handleClick = (e) => {
        if (isEditMode) {
            e.preventDefault();
            return;
        }
        try {
            const link = url.startsWith('http') ? url : `http://${url}`;
            window.open(link, '_blank');
        } catch (e) {
            console.error("Failed to open URL:", e);
        }
    };
    
    const handleCopy = (e, text, fieldName) => {
        e.stopPropagation();
        copyToClipboard(text, () => {
            setCopiedField(fieldName);
        });
    };
    
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', item.id);
        e.currentTarget.classList.add('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (isEditMode) {
             e.currentTarget.classList.add('shadow-xl', 'ring-2', 'ring-indigo-500');
        }
    };
    
    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('shadow-xl', 'ring-2', 'ring-indigo-500');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        // e.stopPropagation();
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
            className={`group bg-white/50 dark:bg-gray-800/70 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-400 transition duration-300 ease-out cursor-pointer backdrop-blur-sm relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1
                ${isEditMode ? 'ring-2 ring-yellow-500 border-yellow-300 hover:shadow-yellow-500/50 cursor-move hover:-translate-y-0' : ''}
            `}
        >
            
            {/* Action Buttons Container */}
            <div className="absolute top-2 right-2 flex space-x-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                    }}
                    className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                    title="Edit Item"
                >
                    <FaRegEdit size={16} />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                    title="Delete Item"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>

            {/* Icon and Name */}
            <div className="flex items-center space-x-3 mb-3">
                <IconComponent 
                    name={icon} 
                    className="text-indigo-500 dark:text-indigo-300" 
                    size={32}
                />
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
                                <><FaCheck size={14} className="mr-1" /> Copied!</>
                            ) : (
                                <><FaUser size={14} className="mr-1" /> Copy User</>
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
                                <><FaCheck size={14} className="mr-1" /> Copied!</>
                            ) : (
                                <><FaKey size={14} className="mr-1" /> Copy Secret</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* URL Tag */}
            <div className="flex justify-between items-center text-s mt-3">
                <div className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full inline-block self-start">
                    {(url.startsWith('http://') || url.startsWith('https://')) 
                        ? (new URL(url).hostname || url)
                        : (url.includes('.') ? url.split('/')[0] : 'Link')}
                </div>
            </div>
        </div>
    );
};