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
    color: '#dc2626',
    bgColor: 'bg-[#dc2626]',
    textColor: 'text-white',
    borderColor: 'border-[#dc2626]',
    hoverBg: 'hover:bg-[#b91c1c]',
    ringColor: 'ring-[#dc2626]'
  },
  [ENVIRONMENTS.STAGING]: {
    label: 'Staging',
    color: '#f97316',
    bgColor: 'bg-[#f97316]',
    textColor: 'text-white',
    borderColor: 'border-[#f97316]',
    hoverBg: 'hover:bg-[#ea580c]',
    ringColor: 'ring-[#f97316]'
  },
  [ENVIRONMENTS.QA]: {
    label: 'QA',
    color: '#9333ea',
    bgColor: 'bg-[#9333ea]',
    textColor: 'text-white',
    borderColor: 'border-[#9333ea]',
    hoverBg: 'hover:bg-[#7e22ce]',
    ringColor: 'ring-[#9333ea]'
  },
  [ENVIRONMENTS.DEVELOPMENT]: {
    label: 'Development',
    color: '#16a34a',
    bgColor: 'bg-[#16a34a]',
    textColor: 'text-white',
    borderColor: 'border-[#16a34a]',
    hoverBg: 'hover:bg-[#15803d]',
    ringColor: 'ring-[#16a34a]'
  },
  [ENVIRONMENTS.COMMON]: {
    label: 'Common',
    color: '#3b82f6',
    bgColor: 'bg-[#3b82f6]',
    textColor: 'text-white',
    borderColor: 'border-[#3b82f6]',
    hoverBg: 'hover:bg-[#2563eb]',
    ringColor: 'ring-[#3b82f6]'
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
