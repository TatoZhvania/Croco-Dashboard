import React from 'react';
import { RiLoader2Fill } from "react-icons/ri";

export const LoadingSpinner = ({ message = "Loading Data from Flask API..." }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <RiLoader2Fill className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="ml-3 text-lg text-gray-600 dark:text-gray-400">{message}</p>
        </div>
    );
};