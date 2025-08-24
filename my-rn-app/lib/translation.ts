// Translation utility helpers
// This file provides helper functions for components that need translations

import { useTranslation } from '../contexts/TranslationContext';

/**
 * Hook for getting translation function in components
 * Usage: const t = useT();
 */
export const useT = () => {
  const { t } = useTranslation();
  return t;
};

/**
 * Hook for getting language and translation functions
 * Usage: const { language, t, setLanguage } = useLanguage();
 */
export const useLanguage = () => {
  const { language, setLanguage, t } = useTranslation();
  return { language, setLanguage, t };
};
