import React, { useState, useEffect, useRef } from 'react';
import { IconComponent } from '../../utils/icons.jsx';
import { copyToClipboard } from '../../utils/clipboard.jsx';
import { useLinkStatus } from '../../hooks/useLinkStatus.jsx';
import { FaRegEdit, FaCheck, FaUser, FaKey, FaEyeSlash } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";


export const DashboardItem = ({ item, onDelete, onEdit, isEditMode, canManage, onDropItem, onUpdateSize, onResizePreview, onResizeEnd }) => {
    const { id, name, url, description, icon, username, secretKey, isAdminOnly, is_admin_only, size } = item;
    const [copiedField, setCopiedField] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [previewSize, setPreviewSize] = useState(null);
    const allowDrag = canManage && isEditMode;
    const scrollIntervalRef = useRef(null);
    
    // Convert is_admin_only to boolean (database returns 0/1)
    const itemIsAdminOnly = Boolean(isAdminOnly || is_admin_only);
    
    // Use preview size during resize, otherwise use actual size
    const currentSize = isResizing && previewSize ? previewSize : size;
    
    // Check if item is extra-small size
    const isExtraSmall = currentSize === 'extra-small';
    
    // Check link status
    const { status } = useLinkStatus(url, true);

    useEffect(() => {
        if (copiedField) {
            const timer = setTimeout(() => setCopiedField(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [copiedField]);

    const handleClick = (e) => {
        // Don't open link if we're in edit mode or just finished resizing
        if (isEditMode || isResizing) {
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
        if (!allowDrag || isResizing) return;
        e.dataTransfer.setData('text/plain', item.id);
        e.currentTarget.classList.add('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
        
        // Start auto-scroll detection
        const autoScroll = (clientY) => {
            const scrollThreshold = 100; // pixels from edge to trigger scroll
            const scrollSpeed = 10; // pixels per interval
            
            const viewportHeight = window.innerHeight;
            
            // Clear any existing interval
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
            
            // Scroll up when near top
            if (clientY < scrollThreshold) {
                scrollIntervalRef.current = setInterval(() => {
                    window.scrollBy(0, -scrollSpeed);
                }, 16); // ~60fps
            }
            // Scroll down when near bottom
            else if (clientY > viewportHeight - scrollThreshold) {
                scrollIntervalRef.current = setInterval(() => {
                    window.scrollBy(0, scrollSpeed);
                }, 16);
            }
        };
        
        // Listen for drag movement
        const handleDragMove = (dragEvent) => {
            autoScroll(dragEvent.clientY);
        };
        
        document.addEventListener('drag', handleDragMove);
        e.currentTarget.addEventListener('dragend', () => {
            document.removeEventListener('drag', handleDragMove);
        }, { once: true });
    };

    const handleDragEnd = (e) => {
        if (!allowDrag) return;
        e.currentTarget.classList.remove('opacity-40', 'border-dashed', 'border-4', 'border-indigo-500');
        
        // Clear auto-scroll interval
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (allowDrag) {
             e.currentTarget.classList.add('shadow-xl', 'ring-2', 'ring-indigo-500');
        }
    };
    
    const handleDragLeave = (e) => {
        if (!allowDrag) return;
        e.currentTarget.classList.remove('shadow-xl', 'ring-2', 'ring-indigo-500');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        // e.stopPropagation();
        e.currentTarget.classList.remove('shadow-xl', 'ring-2', 'ring-indigo-500');
        if (allowDrag) {
            const draggedItemId = e.dataTransfer.getData('text/plain');
            const targetItemId = item.id;
            if (draggedItemId && draggedItemId !== targetItemId) {
                onDropItem(draggedItemId, targetItemId, item.category);
            }
        }
    };

    const handleResizeStart = (e, direction) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Immediately set resizing to true to block all other interactions
        setIsResizing(true);

        const startX = e.clientX;
        const container = e.target.closest('.group');

        const sizeOptions = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
        const currentSizeIndex = sizeOptions.indexOf(size || 'medium');
        
        let currentPreviewIndex = currentSizeIndex;

        const handleMouseMove = (moveEvent) => {
            moveEvent.stopPropagation();
            moveEvent.preventDefault();
            
            const deltaX = direction === 'right' 
                ? moveEvent.clientX - startX 
                : startX - moveEvent.clientX;
            
            // Each 120px of drag changes size by one step (increased from 60px for better control)
            const stepSize = 120;
            const steps = Math.round(deltaX / stepSize);
            
            // Calculate new size index (clamped to valid range)
            const newSizeIndex = Math.max(0, Math.min(sizeOptions.length - 1, currentSizeIndex + steps));
            
            // Only update if size actually changed from current preview
            if (newSizeIndex !== currentPreviewIndex) {
                currentPreviewIndex = newSizeIndex;
                const newSize = sizeOptions[newSizeIndex];
                
                // Visual feedback - show preview size
                setPreviewSize(newSize);
                
                // Notify parent so it can update the grid layout
                try {
                    onResizePreview && onResizePreview(id, newSize, container.getBoundingClientRect(), container.parentElement.getBoundingClientRect());
                } catch (err) {
                    // ignore
                }
            }
        };

        const handleMouseUp = (upEvent) => {
            upEvent.stopPropagation();
            upEvent.preventDefault();
            
            const deltaX = direction === 'right' 
                ? upEvent.clientX - startX 
                : startX - upEvent.clientX;
            
            // Calculate final size based on steps
            const stepSize = 120;
            const steps = Math.round(deltaX / stepSize);
            const newSizeIndex = Math.max(0, Math.min(sizeOptions.length - 1, currentSizeIndex + steps));
            const newSize = sizeOptions[newSizeIndex];

            // Only update if size actually changed
            if (newSize !== size) {
                // Call onUpdateSize if provided, otherwise fall back to onEdit
                if (onUpdateSize) {
                    onUpdateSize(id, newSize);
                } else {
                    onEdit({ ...item, size: newSize });
                }
            }

            container.style.opacity = '1';
            
            // Clear preview size
            setPreviewSize(null);
            try {
                onResizePreview && onResizePreview(id, null, container.getBoundingClientRect(), container.parentElement.getBoundingClientRect());
            } catch (err) {}

            try {
                onResizeEnd && onResizeEnd(id);
            } catch (err) {}
            
            // Add a small delay before allowing interactions again
            setTimeout(() => {
                setIsResizing(false);
            }, 200);

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            onClick={handleClick}
            draggable={allowDrag && !isResizing ? 'true' : 'false'}
            onDragStart={allowDrag ? handleDragStart : undefined}
            onDragEnd={allowDrag ? handleDragEnd : undefined}
            onDragOver={allowDrag ? handleDragOver : undefined}
            onDragLeave={allowDrag ? handleDragLeave : undefined}
            onDrop={allowDrag ? handleDrop : undefined}
            className={`group bg-white/50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-400 transition duration-300 ease-out cursor-pointer backdrop-blur-sm relative overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 min-h-[180px]
                ${isExtraSmall ? 'p-2' : 'p-4'}
                ${allowDrag && !isResizing ? 'ring-2 ring-yellow-500 border-yellow-300 hover:shadow-yellow-500/50 cursor-move hover:-translate-y-0' : ''}
                ${isResizing ? 'select-none ring-4 ring-indigo-500 border-indigo-500 shadow-2xl shadow-indigo-500/50' : ''}
            `}
            title={isExtraSmall ? `${name}${description ? ' - ' + description : ''}\n${url}` : ''}
        >
            {/* Resize indicator - minimal badge */}
            {isResizing && previewSize && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                    <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-2xl font-bold text-sm animate-pulse">
                        {previewSize === 'extra-small' && 'XS'}
                        {previewSize === 'small' && 'S'}
                        {previewSize === 'medium' && 'M'}
                        {previewSize === 'large' && 'L'}
                        {previewSize === 'extra-large' && 'XL'}
                    </div>
                </div>
            )}
            
            {/* Resize Handles - Only visible in edit mode */}
            {allowDrag && (
                <>
                    {/* Left Resize Handle */}
                    <div
                        onMouseDown={(e) => handleResizeStart(e, 'left')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-indigo-500/0 hover:bg-indigo-500/50 transition-colors z-20 group/handle"
                        title="Drag to resize"
                    >
                        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Right Resize Handle */}
                    <div
                        onMouseDown={(e) => handleResizeStart(e, 'right')}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-indigo-500/0 hover:bg-indigo-500/50 transition-colors z-20 group/handle"
                        title="Drag to resize"
                    >
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full opacity-0 group-hover/handle:opacity-100 transition-opacity" />
                    </div>
                </>
            )}
            
            {/* Admin Only Badge - Top Right (only visible to admins) */}
            {canManage && itemIsAdminOnly && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-amber-500/90 dark:bg-amber-600/90 text-white text-xs px-2 py-1 rounded-full shadow-md z-10"
                    title="This item is only visible to administrators">
                    <FaEyeSlash size={12} />
                    {!isExtraSmall && <span className="font-semibold">Admin Only</span>}
                </div>
            )}
            
            {/* Action Buttons Container - positioned below badge when admin-only */}
            {canManage && (
                <div className={`absolute right-2 flex space-x-1 ${itemIsAdminOnly ? 'top-10' : 'top-2'} ${isResizing ? 'pointer-events-none' : ''}`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isResizing) {
                                onEdit(item);
                            }
                        }}
                        className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                        title="Edit Item"
                    >
                        <FaRegEdit size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isResizing) {
                                onDelete(item);
                            }
                        }}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-white/70 dark:bg-gray-900/70 hover:bg-white dark:hover:bg-gray-700"
                        title="Delete Item"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            )}

            {/* Icon and Name */}
            <div className={`flex items-center ${isExtraSmall ? 'space-x-2 mb-2' : 'space-x-3 mb-3'}`}>
                <IconComponent 
                    name={icon} 
                    className="text-indigo-500 dark:text-indigo-300 flex-shrink-0" 
                    size={isExtraSmall ? 24 : 32}
                />
                <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${isExtraSmall ? 'text-xl' : 'text-xl'}`}>
                    {name}
                </h3>
            </div>
            
            {/* Description - Hide on extra-small */}
            {!isExtraSmall && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {description}
                </p>
            )}
            
            {/* Credential Actions */}
            {(username || secretKey) && (
                <div className={`flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50 -mx-4 px-4 mt-auto ${isExtraSmall ? 'flex-row gap-1' : 'flex-wrap'}`}>
                    {username && (
                        <button
                            onClick={(e) => handleCopy(e, username, 'username')}
                            className={`px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center ${isExtraSmall ? 'text-[11px] flex-1 justify-center' : 'text-xs'}`}
                            title="Copy Username to Clipboard"
                        >
                            {copiedField === 'username' ? (
                                <><FaCheck size={isExtraSmall ? 11 : 14} className="mr-1" /> {isExtraSmall ? '✓' : 'Copied!'}</>
                            ) : (
                                <><FaUser size={isExtraSmall ? 11 : 14} className="mr-1" /> {isExtraSmall ? 'CP User' : 'Copy User'}</>
                            )}
                        </button>
                    )}
                    {secretKey && (
                        <button
                            onClick={(e) => handleCopy(e, secretKey, 'secretKey')}
                            className={`px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition flex items-center ${isExtraSmall ? 'text-[11px] flex-1 justify-center' : 'text-xs'}`}
                            title="Copy Secret Key to Clipboard"
                        >
                            {copiedField === 'secretKey' ? (
                                <><FaCheck size={isExtraSmall ? 11 : 14} className="mr-1" /> {isExtraSmall ? '✓' : 'Copied!'}</>
                            ) : (
                                <><FaKey size={isExtraSmall ? 11 : 14} className="mr-1" /> {isExtraSmall ? 'CP Secret' : 'Copy Secret'}</>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* URL Tag */}
            <div className={`flex justify-between items-center mt-3 ${isExtraSmall ? 'text-[20px] mt-2' : 'text-s'}`}>
                <div className={`text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 rounded-full inline-block self-start truncate ${isExtraSmall ? 'px-1.5 py-0.5 text-center w-full text-[15px]' : 'px-2 py-0.5'}`}>
                    {(url.startsWith('http://') || url.startsWith('https://')) 
                        ? (new URL(url).hostname || url)
                        : (url.includes('.') ? url.split('/')[0] : 'Link')}
                </div>
            </div>

            {/* Link Status Indicator - Bottom Right Corner */}
            <div 
                className={`absolute rounded-full transition-all duration-300 ${
                    isExtraSmall ? 'bottom-1 right-1 w-2 h-2' : 'bottom-2 right-2 w-3 h-3'
                } ${
                    status === 'reachable' 
                        ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-twinkle' 
                        : status === 'unreachable' 
                        ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-twinkle-slow' 
                        : 'bg-gray-400 animate-pulse'
                }`}
                title={
                    status === 'reachable' 
                        ? 'Link is reachable' 
                        : status === 'unreachable' 
                        ? 'Link is unreachable' 
                        : 'Checking link status...'
                }
            />
        </div>
    );
};
