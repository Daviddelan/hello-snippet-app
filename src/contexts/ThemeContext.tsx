import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface ThemeColors {
  primary: string;
  secondary: string;
  primaryRgb?: string;
  secondaryRgb?: string;
}

export interface ThemeContextType {
  colors: ThemeColors;
  logoUrl?: string;
  currencySymbol: string;
  currencyCode: string;
  updateTheme: (colors: ThemeColors) => void;
  updateLogo: (url: string) => void;
  updateCurrency: (code: string, symbol: string) => void;
  isLoading: boolean;
}

const defaultColors: ThemeColors = {
  primary: '#001B79',
  secondary: '#0066CC',
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  currencySymbol: '$',
  currencyCode: 'USD',
  updateTheme: () => {},
  updateLogo: () => {},
  updateCurrency: () => {},
  isLoading: true,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 27, 121';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}

function applyThemeToDocument(colors: ThemeColors) {
  const root = document.documentElement;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-primary-rgb', hexToRgb(colors.primary));
  root.style.setProperty('--color-secondary-rgb', hexToRgb(colors.secondary));
}

interface ThemeProviderProps {
  children: ReactNode;
  organizerId?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, organizerId }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (organizerId) {
      loadOrganizerTheme(organizerId);
    } else {
      setIsLoading(false);
    }
  }, [organizerId]);

  const loadOrganizerTheme = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('primary_color, secondary_color, logo_url, default_currency, currency_symbol')
        .eq('id', orgId)
        .maybeSingle();

      if (error) {
        console.error('Error loading theme:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const themeColors: ThemeColors = {
          primary: data.primary_color || defaultColors.primary,
          secondary: data.secondary_color || defaultColors.secondary,
        };

        setColors(themeColors);
        applyThemeToDocument(themeColors);

        if (data.logo_url) {
          setLogoUrl(data.logo_url);
        }

        if (data.currency_symbol) {
          setCurrencySymbol(data.currency_symbol);
        }

        if (data.default_currency) {
          setCurrencyCode(data.default_currency);
        }
      }
    } catch (error) {
      console.error('Error in loadOrganizerTheme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTheme = (newColors: ThemeColors) => {
    setColors(newColors);
    applyThemeToDocument(newColors);
  };

  const updateLogo = (url: string) => {
    setLogoUrl(url);
  };

  const updateCurrency = (code: string, symbol: string) => {
    setCurrencyCode(code);
    setCurrencySymbol(symbol);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
        logoUrl,
        currencySymbol,
        currencyCode,
        updateTheme,
        updateLogo,
        updateCurrency,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
