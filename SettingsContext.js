import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

const SettingsContext = createContext();

const translations = {
  es: {
    welcome: "Hola,",
    balance: "Saldo Disponible",
    jobs_title: "Trabajos Disponibles",
    btn_request: "🚀 Pedir Servicio",
    btn_work: "🛠️ Modo Trabajador",
    auth_btn: "INGRESAR",
    auth_subtitle: "Soluciones inmediatas",
    save: "Guardar",
    back: "← Volver",
    request_title: "Solicitar Servicio",
    profile_title: "Perfil Profesional",
    name: "Nombre completo",
    specialty: "Especialidad",
    price: "Precio/Tarifa"
  },
  en: {
    welcome: "Hello,",
    balance: "Available Balance",
    jobs_title: "Available Jobs",
    btn_request: "🚀 Request Service",
    btn_work: "🛠️ Worker Mode",
    auth_btn: "SIGN IN",
    auth_subtitle: "Immediate solutions",
    save: "Save",
    back: "← Back",
    request_title: "Request Service",
    profile_title: "Professional Profile",
    name: "Full Name",
    specialty: "Specialty",
    price: "Price/Rate"
  }
};

export const SettingsProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const [language, setLanguage] = useState('es');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLanguage = () => setLanguage(prev => prev === 'es' ? 'en' : 'es');

  const colors = {
    background: isDarkMode ? '#121212' : '#F8F9FF',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1E293B',
    textMuted: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#333333' : '#E5E7EB',
    primary: '#6366F1',
    success: '#10B981',
    inputBg: isDarkMode ? '#252525' : '#F9FAFB',
  };

  const t = (key) => translations[language][key] || key;

  return (
    <SettingsContext.Provider value={{ colors, isDarkMode, toggleTheme, language, toggleLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);