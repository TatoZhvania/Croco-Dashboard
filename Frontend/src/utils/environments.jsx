// Environment configuration and utilities

export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  QA: 'qa',
  DEVELOPMENT: 'development',
  COMMON: 'common'
};

export const ENVIRONMENT_CONFIG = {
  [ENVIRONMENTS.PRODUCTION]: {
    label: 'Production',
    color: '#7f1d1d', // Very dark red background
    textColor: '#fca5a5', // Light red text
    bgColor: 'bg-[#7f1d1d]',
    borderColor: 'border-[#7f1d1d]',
    hoverBg: 'hover:bg-[#991b1b]',
    ringColor: 'ring-[#7f1d1d]'
  },
  [ENVIRONMENTS.STAGING]: {
    label: 'Staging',
    color: '#9a3412', // Very dark orange background
    textColor: '#fdba74', // Light orange text
    bgColor: 'bg-[#9a3412]',
    borderColor: 'border-[#9a3412]',
    hoverBg: 'hover:bg-[#c2410c]',
    ringColor: 'ring-[#9a3412]'
  },
  [ENVIRONMENTS.QA]: {
    label: 'QA',
    color: '#581c87', // Very dark purple background
    textColor: '#d8b4fe', // Light purple text
    bgColor: 'bg-[#581c87]',
    borderColor: 'border-[#581c87]',
    hoverBg: 'hover:bg-[#6b21a8]',
    ringColor: 'ring-[#581c87]'
  },
  [ENVIRONMENTS.DEVELOPMENT]: {
    label: 'Development',
    color: '#14532d', // Very dark green background
    textColor: '#86efac', // Light green text
    bgColor: 'bg-[#14532d]',
    borderColor: 'border-[#14532d]',
    hoverBg: 'hover:bg-[#166534]',
    ringColor: 'ring-[#14532d]'
  },
  [ENVIRONMENTS.COMMON]: {
    label: 'Common',
    color: '#1e40af', // Very dark blue background
    textColor: '#93c5fd', // Light blue text
    bgColor: 'bg-[#1e40af]',
    borderColor: 'border-[#1e40af]',
    hoverBg: 'hover:bg-[#1d4ed8]',
    ringColor: 'ring-[#1e40af]'
  }
};

export const getEnvironmentConfig = (environment) => {
  return ENVIRONMENT_CONFIG[environment] || ENVIRONMENT_CONFIG[ENVIRONMENTS.COMMON];
};

export const getEnvironmentColor = (environment) => {
  const config = getEnvironmentConfig(environment);
  return config.color;
};

export const getEnvironmentLabel = (environment) => {
  const config = getEnvironmentConfig(environment);
  return config.label;
};

// For filter dropdown - includes "All" option
export const ENVIRONMENT_FILTER_OPTIONS = [
  { value: ENVIRONMENTS.PRODUCTION, label: 'Production' },
  { value: ENVIRONMENTS.STAGING, label: 'Staging' },
  { value: ENVIRONMENTS.QA, label: 'QA' },
  { value: ENVIRONMENTS.DEVELOPMENT, label: 'Development' },
  { value: ENVIRONMENTS.COMMON, label: 'Common' }
];

// For item form - no "All" option
export const ENVIRONMENT_OPTIONS = [
  { value: ENVIRONMENTS.PRODUCTION, label: 'Production' },
  { value: ENVIRONMENTS.STAGING, label: 'Staging' },
  { value: ENVIRONMENTS.QA, label: 'QA' },
  { value: ENVIRONMENTS.DEVELOPMENT, label: 'Development' },
  { value: ENVIRONMENTS.COMMON, label: 'Common' }
];
