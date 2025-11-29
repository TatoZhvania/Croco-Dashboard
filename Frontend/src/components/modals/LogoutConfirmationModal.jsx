import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { FaSignOutAlt } from 'react-icons/fa';

export const LogoutConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-300">
                    <FiAlertTriangle size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Sign out?
                    </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    You will return to guest mode!
                </p>
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150"
                    >
                        Stay signed in
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 flex items-center"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
};
