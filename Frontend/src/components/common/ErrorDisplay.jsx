import React from 'react';
import { MdOutlineWifiOff } from "react-icons/md";
import { FiRotateCw } from "react-icons/fi";

export const ErrorDisplay = ({ error, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-red-950 p-6">
            <MdOutlineWifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
            <h2 className="mt-4 text-2xl font-bold text-red-800 dark:text-red-300">Connection Error</h2>
            <p className="mt-2 text-center text-red-700 dark:text-red-400">
                {error}
            </p>
            <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150 flex items-center"
            >
                <FiRotateCw size={18} className="mr-2" />
                Try Reconnecting
            </button>
        </div>
    );
};