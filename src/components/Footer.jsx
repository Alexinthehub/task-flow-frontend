import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className="text-center text-gray-500 dark:text-gray-400 text-sm py-4 border-t border-gray-200 dark:border-gray-700 mt-8">
      &copy; {year} TaskFlow. {t('All Rights Reserved')}
    </footer>
  );
};

export default Footer;