import React from 'react';
import * as Si from 'react-icons/si';
import * as Fa from 'react-icons/fa';
import * as Md from 'react-icons/md';
import * as Io from 'react-icons/io5';
import * as Hi from 'react-icons/hi';
import * as Fi from 'react-icons/fi';
import * as Gr from 'react-icons/gr';
import * as Tb from 'react-icons/tb';
import * as Bi from 'react-icons/bi';
import * as Cg from 'react-icons/cg';

// Helper to normalize icon names for better matching
export const normalizeIconName = (name) => {
    if (!name || typeof name !== 'string') return '';
    
    const nameStr = name.toString().trim();
    if (!nameStr) return '';

    // Special cases for common DevOps/SRE tools
    const specialCases = {
        // DevOps & Cloud
        'argocd': 'Argo',
        'grafana': 'Grafana',
        'kubernetes': 'Kubernetes',
        'prometheus': 'Prometheus',
        'terraform': 'Terraform',
        'ansible': 'Ansible',
        'jenkins': 'Jenkins',
        'docker': 'Docker',
        'gitlab': 'Gitlab',
        'github': 'Github',
        'bitcoin': 'Bitcoin',
        'ethereum': 'Ethereum',
        
        // Cloud Providers
        'aws': 'Aws',
        'digitalocean': 'DigitalOcean',
        
        // Databases
        'mongodb': 'Mongodb',
        'postgresql': 'Postgresql',
        'mysql': 'Mysql',
        'redis': 'Redis',
        'elasticsearch': 'Elasticsearch',
        
        // Languages
        'javascript': 'Javascript',
        'typescript': 'Typescript',
        'python': 'Python',
        'golang': 'Go',
        'rust': 'Rust',
        'java': 'Java',
        'php': 'Php',
        'ruby': 'Ruby',
        'c++': 'Cplusplus',
        'c#': 'CSharp',
    };
    
    const lowerName = nameStr.toLowerCase();
    if (specialCases[lowerName]) {
        return specialCases[lowerName];
    }
    
    // Remove common prefixes/suffixes and clean up
    let cleanedName = nameStr
        .replace(/icon$/i, '')
        .replace(/^icon/i, '')
        .trim();
    
    // Capitalize first letter for better matching
    cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
    
    return cleanedName;
};

// Helper to render icons dynamically from multiple libraries
export const IconComponent = ({ name, className, color, size = 24, ...props }) => {
    if (!name) {
        const DefaultIcon = Si.SiReact;
        return <DefaultIcon className={className} color={color || "#00D8FF"} size={size} {...props} />;
    }

    const normalizedName = normalizeIconName(name);
    const formattedName = normalizedName.replace(/\s+/g, '');
    
    // Try to find the icon in different libraries
    let IconComponent = null;
    
    // Search order: Simple Icons → Font Awesome → Material Design → etc.
    const searchPatterns = [
        // Simple Icons (most likely for tech logos)
        { lib: Si, prefix: 'Si' },
        // Font Awesome
        { lib: Fa, prefix: 'Fa' },
        // Material Design
        { lib: Md, prefix: 'Md' },
        // Ionicons
        { lib: Io, prefix: 'Io' },
        // Heroicons
        { lib: Hi, prefix: 'Hi' },
        // Feather
        { lib: Fi, prefix: 'Fi' },
        // Grommet
        { lib: Gr, prefix: 'Gr' },
        // Tabler Icons
        { lib: Tb, prefix: 'Tb' },
        // BoxIcons
        { lib: Bi, prefix: 'Bi' },
        // CSS.GG
        { lib: Cg, prefix: 'Cg' },
    ];

    for (const { lib, prefix } of searchPatterns) {
        const iconName = `${prefix}${formattedName}`;
        if (lib[iconName]) {
            IconComponent = lib[iconName];
            break;
        }
        
        // Also try without prefix for some libraries that might have direct matches
        if (lib[formattedName]) {
            IconComponent = lib[formattedName];
            break;
        }
    }

    if (!IconComponent) {
        console.warn(`Icon "${name}" (normalized: "${normalizedName}") not found in any library.`);
        const FallbackIcon = Si.SiReact;
        return <FallbackIcon className={className} color={color || "#00D8FF"} size={size} {...props} />;
    }

    return (
        <IconComponent 
            className={className}
            color={color}
            size={size}
            {...props}
        />
    );
};

// Export individual icon sets for direct imports if needed
export { Si, Fa, Md, Io, Hi, Fi, Gr, Tb, Bi, Cg };

// Default export
export default IconComponent;