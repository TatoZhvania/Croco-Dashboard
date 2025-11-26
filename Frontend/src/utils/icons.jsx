import React from 'react';
import * as lucide from 'lucide-react';

// Helper to render Lucide Icons dynamically
export const IconComponent = ({ name, className }) => {
    const Icon = lucide[name] || lucide.Link;
    return <Icon className={className} />;
};