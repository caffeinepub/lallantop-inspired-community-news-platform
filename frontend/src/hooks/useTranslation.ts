import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../constants/translations';

export function useTranslation() {
  const { language } = useLanguage();
  const t = translations[language];
  return { t, language };
}
