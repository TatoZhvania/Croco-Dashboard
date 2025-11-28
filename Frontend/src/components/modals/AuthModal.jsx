import React, { useEffect, useState } from 'react';
import { FaLock, FaUserShield } from 'react-icons/fa';
import { RiLoader2Fill } from 'react-icons/ri';

export const AuthModal = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setUsername('');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit({ username, password });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 md:p-8">
                <div className="flex items-center mb-4">
                    <FaUserShield className="text-indigo-600 dark:text-indigo-300 w-8 h-8 mr-2" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Sign In</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enter admin credentials to manage links.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 text-sm border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Username</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Password</span>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-10"
                                required
                            />
                        </div>
                    </label>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:opacity-60 flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <RiLoader2Fill className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <FaUserShield className="w-4 h-4 mr-2" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
