import React from 'react';
import * as Si from 'react-icons/si'; // ← lowercase 'si'
import * as Fa from 'react-icons/fa'; // Font Awesome
import * as Md from 'react-icons/md'; // Material Design
import * as Io from 'react-icons/io5'; // Ionicons
import * as Hi from 'react-icons/hi'; // Heroicons
import * as Fi from 'react-icons/fi'; // Feather
import * as Gr from 'react-icons/gr'; // Grommet

// Helper to render icons dynamically from multiple libraries
export const IconComponent = ({ name, className, color, size = 24 }) => {
    if (!name) {
        const DefaultIcon = Si.SiReact;
        return <DefaultIcon className={className} color="#00D8FF" size={size} />;
    }

    // Try to find the icon in different libraries
    let IconComponent = null;
    
    // Remove spaces and convert to proper format
    const formattedName = name.replace(/\s+/g, '');
    
    // Search in this order: Simple Icons → Font Awesome → Material Design → etc.
    if (Si[`Si${formattedName}`]) {
        IconComponent = Si[`Si${formattedName}`];
    } else if (Fa[`Fa${formattedName}`]) {
        IconComponent = Fa[`Fa${formattedName}`];
    } else if (Md[`Md${formattedName}`]) {
        IconComponent = Md[`Md${formattedName}`];
    } else if (Io[`Io${formattedName}`]) {
        IconComponent = Io[`Io${formattedName}`];
    } else if (Hi[`Hi${formattedName}`]) {
        IconComponent = Hi[`Hi${formattedName}`];
    } else if (Fi[`Fi${formattedName}`]) {
        IconComponent = Fi[`Fi${formattedName}`];
    } else if (Gr[`Gr${formattedName}`]) {
        IconComponent = Gr[`Gr${formattedName}`];
    }

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in any library.`);
        const FallbackIcon = Si.SiReact;
        return <FallbackIcon className={className} color="#00D8FF" size={size} />;
    }

    return (
        <IconComponent 
            className={className}
            color={color}
            size={size}
        />
    );
};

// Popular icons organized by category
export const POPULAR_ICONS = {
    // DevOps & Cloud
    devops: ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'AWS', 'Azure', 'GCP'],
    
    // Programming Languages
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'C', 'Cplusplus'],
    
    // Frameworks
    frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Spring', 'Laravel'],
    
    // Databases
    databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite'],
    
    // Tools
    tools: ['VSCode', 'Figma', 'Slack', 'Discord', 'Notion', 'Trello', 'Jira'],
    
    // Operating Systems
    os: ['Linux', 'Windows', 'Apple', 'Android'],
    
    // Social
    social: ['Google', 'Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'YouTube']
};

// Get all popular icons as a flat array
export const ALL_POPULAR_ICONS = Object.values(POPULAR_ICONS).flat();