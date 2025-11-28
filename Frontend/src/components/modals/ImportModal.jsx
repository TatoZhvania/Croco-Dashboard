import React, { useEffect, useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { RiLoader2Fill } from 'react-icons/ri';

export const ImportModal = ({ isOpen, onClose, onImport, isLoading, error }) => {
    const [jsonText, setJsonText] = useState('');
    const [replaceExisting, setReplaceExisting] = useState(false);
    const [parseError, setParseError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setParseError(null);
        } else {
            setJsonText('');
            setReplaceExisting(false);
            setParseError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setJsonText(text);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setParseError(null);

        try {
            const parsed = JSON.parse(jsonText);
            const items = Array.isArray(parsed) ? parsed : parsed.items;
            if (!Array.isArray(items) || items.length === 0) {
                setParseError('JSON must be an array or an object with an "items" array.');
                return;
            }
            await onImport(items, replaceExisting);
        } catch (err) {
            setParseError('Invalid JSON. Please check the content and try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-300">
                    <FiUploadCloud size={24} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Import dashboard
                    </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    Paste your exported JSON or upload a file. Optionally replace existing items.
                </p>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                {parseError && (
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                        {parseError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="application/json,.json"
                            onChange={handleFileChange}
                            className="block text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">or paste JSON below</span>
                    </div>

                    <textarea
                        rows={10}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder='{"items":[ ... ]}'
                    />

                    <label className="inline-flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                            type="checkbox"
                            checked={replaceExisting}
                            onChange={(e) => setReplaceExisting(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span>Replace existing items before importing</span>
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
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <FiUploadCloud className="mr-2" />
                                    Import
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
