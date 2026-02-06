
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

const resources = {
    en: {
        translation: enUS,
    },
    zh: {
        translation: zhCN,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en', // Default to English for overseas app
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        compatibilityJSON: 'v3',
    });

export default i18n;
