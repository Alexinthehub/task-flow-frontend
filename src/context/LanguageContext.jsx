import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    settings: 'Settings',
    general: 'General',
    account: 'Account',
    app: 'App',
    support: 'Support',
    theme: 'App Theme',
    language: 'Language',
    editProfile: 'Edit Profile',
    changePassword: 'Change Password',
    about: 'About TaskFlow',
    privacy: 'Privacy Notice',
    feedback: 'Give us feedback',
  },
  sw: {
    dashboard: 'Dashibodi',
    tasks: 'Kazi',
    notifications: 'Arifa',
    profile: 'Wasifu',
    logout: 'Toka',
    settings: 'Mipangilio',
    general: 'Jumla',
    account: 'Akaunti',
    app: 'Programu',
    support: 'Msaada',
    theme: 'Mandhari',
    language: 'Lugha',
    editProfile: 'Hariri Wasifu',
    changePassword: 'Badilisha Nenosiri',
    about: 'Kuhusu TaskFlow',
    privacy: 'Sera ya Faragha',
    feedback: 'Tupatie Maoni',
  },
  fr: {
    dashboard: 'Tableau de bord',
    tasks: 'Tâches',
    notifications: 'Notifications',
    profile: 'Profil',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    general: 'Général',
    account: 'Compte',
    app: 'Application',
    support: 'Assistance',
    theme: 'Thème',
    language: 'Langue',
    editProfile: 'Modifier le profil',
    changePassword: 'Changer le mot de passe',
    about: 'À propos de TaskFlow',
    privacy: 'Politique de confidentialité',
    feedback: 'Donnez-nous votre avis',
  },
  es: {
    dashboard: 'Tablero',
    tasks: 'Tareas',
    notifications: 'Notificaciones',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    settings: 'Configuración',
    general: 'General',
    account: 'Cuenta',
    app: 'Aplicación',
    support: 'Soporte',
    theme: 'Tema',
    language: 'Idioma',
    editProfile: 'Editar perfil',
    changePassword: 'Cambiar contraseña',
    about: 'Acerca de TaskFlow',
    privacy: 'Política de privacidad',
    feedback: 'Danos tu opinión',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => translations[language]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);