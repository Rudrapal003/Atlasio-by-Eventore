// Eventore Design System
// Adapted from index.css for React Native

export const theme = {
  colors: {
    brand: '#1F4E79',
    brandDeep: '#133A5C',
    gold: '#C9A227',
    rose: '#E11D48',
    roseDeep: '#BE123C',
    green: '#059669',
    greenSoft: '#ECFDF5',
    amber: '#D97706',
    amberSoft: '#FEF3C7',
    
    bg: '#F4F1EB',
    surface: '#FFFFFF',
    cream: '#FBF9F4',
    ink: '#0F172A',
    text: '#1F2937',
    muted: '#64748B',
    faint: '#94A3B8',
    line: '#E5E7EB',
    lineStrong: '#CBD5E1',
  },
  
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    pill: 999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
  },
  
  fonts: {
    serif: 'Fraunces_600SemiBold', // Requires Expo Font loading
    sans: 'Inter_400Regular',      // Requires Expo Font loading
  }
};

export const getTheme = (userType) => {
  const isCreator = userType === 'creator';
  return {
    ...theme,
    primary: isCreator ? theme.colors.green : theme.colors.brand,
    secondary: isCreator ? theme.colors.amber : theme.colors.rose,
    accent: isCreator ? theme.colors.brand : theme.colors.gold,
    primarySoft: isCreator ? theme.colors.greenSoft : '#EEF2F6',
  };
};
