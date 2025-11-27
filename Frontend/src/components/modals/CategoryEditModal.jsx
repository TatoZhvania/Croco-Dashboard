import React, { useState, useEffect } from 'react';
import { IconComponent, normalizeIconName } from '../../utils/icons.jsx';
import { FaTimes, FaSave } from 'react-icons/fa';

export const CategoryEditModal = ({
  isOpen,
  initialName,
  initialIcon,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName || '');
  const [icon, setIcon] = useState(initialIcon || 'Folder');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setIcon(initialIcon || 'Folder');
      setError('');
    }
  }, [isOpen, initialName, initialIcon]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedName = (name || '').trim();
    const trimmedIcon = (icon || '').trim();

    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }

    onSave({ name: trimmedName, icon: trimmedIcon || 'Folder' });
  };

  const normalized = normalizeIconName(icon);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-indigo-500/60">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Category</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., DevOps"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon Name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., Folder, Docker, GitHub"
              />
              <div className="w-10 h-10 flex items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                <IconComponent name={icon || 'Folder'} className="text-indigo-600 dark:text-indigo-300" size={22} title={normalized} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
          >
            <FaSave size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditModal;
