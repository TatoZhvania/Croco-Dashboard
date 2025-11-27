import React from 'react';
import { CiFilter } from "react-icons/ci";
import { CiFaceFrown } from "react-icons/ci";

export const EmptyState = ({ type, searchTerm }) => {
    if (type === 'search') {
        return (
            <div className="text-center p-10 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <CiFilter size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
                <h2 className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">No results found for "{searchTerm}"</h2>
                <p className="mt-1 text-gray-500 dark:text-gray-500">
                    Try adjusting your search query or clear the search to see all items.
                </p>
            </div>
        );
    }

    return (
        <div className="text-center p-10 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <CiFaceFrown size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
            <h2 className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">No Dashboard Items Yet</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-500">
                Click "Add New Link" to start building your personalized, persistent dashboard.
            </p>
        </div>
    );
};