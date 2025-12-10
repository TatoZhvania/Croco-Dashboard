import React from 'react';
import { ENVIRONMENT_FILTER_OPTIONS, getEnvironmentConfig } from '../../utils/environments.jsx';

export const EnvironmentFilter = ({ selectedEnvironment, onEnvironmentChange }) => {
    const handleClick = (envValue) => {
        // Toggle behavior: if clicking the same environment, show all (null)
        if (selectedEnvironment === envValue) {
            onEnvironmentChange(null);
        } else {
            onEnvironmentChange(envValue);
        }
    };

    return (
        <div className="mb-6 flex justify-center">
            <div className="inline-flex flex-wrap gap-3 p-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                {ENVIRONMENT_FILTER_OPTIONS.map(env => {
                    const isSelected = selectedEnvironment === env.value;
                    const envConfig = getEnvironmentConfig(env.value);
                    
                    return (
                        <button
                            key={env.value}
                            onClick={() => handleClick(env.value)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                isSelected 
                                    ? 'text-white shadow-xl scale-105' 
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-xl border-2'
                            }`}
                            style={{
                                backgroundColor: isSelected ? envConfig.color : undefined,
                                borderColor: !isSelected ? envConfig.color : undefined,
                                borderWidth: !isSelected ? '1px' : undefined
                            }}
                            title={`${isSelected ? 'Show all links' : `Filter by ${env.label}`}`}
                        >
                            <span className="flex items-center gap-2">
                                <span 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: envConfig.color }}
                                />
                                {env.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
