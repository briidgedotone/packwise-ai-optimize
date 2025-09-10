// QuantiPackAI Design System
// Based on the landing page design for consistency across the application

export const designSystem = {
  colors: {
    // Primary brand color
    primary: '#767AFA',
    primaryLight: '#767AFA20', // 20% opacity for backgrounds
    primaryDark: '#6366F1',
    
    // Background colors
    background: '#F6F6FF', // Main app background
    backgroundSection: 'transparent', // Section backgrounds
    backgroundCard: '#FFFFFF', // Card backgrounds
    backgroundHero: '#F7F6F9', // Hero section fallback
    backgroundOverlay: '#FEFEFB', // Image overlay backgrounds
    
    // Text colors
    textPrimary: '#111827', // text-gray-900 equivalent
    textSecondary: '#4B5563', // text-gray-600 equivalent
    textMuted: '#9CA3AF', // text-gray-500 equivalent
    textWhite: '#FFFFFF',
    
    // Border colors
    borderDefault: '#E5E7EB', // border-gray-200 equivalent
    borderLight: '#F3F4F6', // border-gray-100 equivalent
    
    // Status colors (keeping semantic colors)
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  
  // Border radius values
  borderRadius: {
    none: '0',
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem', // 24px - Our primary radius
    full: '9999px',
  },
  
  // Spacing (using Tailwind's spacing scale)
  spacing: {
    xs: '0.5rem', // 8px
    sm: '1rem', // 16px
    md: '1.5rem', // 24px
    lg: '2rem', // 32px
    xl: '3rem', // 48px
    '2xl': '4rem', // 64px
    '3xl': '5rem', // 80px
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Shadows (minimal, as per landing page)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
};

// Utility function to apply design system classes
export const getCardClasses = (variant: 'default' | 'primary' | 'transparent' = 'default') => {
  const baseClasses = 'rounded-3xl border border-gray-200 overflow-hidden';
  
  switch (variant) {
    case 'primary':
      return `${baseClasses} bg-purple-50 ring-2 ring-[#767AFA]`;
    case 'transparent':
      return `${baseClasses} bg-transparent`;
    default:
      return `${baseClasses} bg-white`;
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-[#767AFA] hover:opacity-90 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200',
    ghost: 'bg-transparent hover:bg-gray-50 text-gray-600',
  };
  
  return `rounded-full font-medium transition-all ${sizeClasses[size]} ${variantClasses[variant]}`;
};

export const getSectionClasses = () => {
  return 'py-20 px-4 sm:px-6 lg:px-8 bg-transparent';
};

export const getContainerClasses = () => {
  return 'max-w-7xl mx-auto';
};