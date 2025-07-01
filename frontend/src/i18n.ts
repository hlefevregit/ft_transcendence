import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		supportedLngs: ['en', 'fr', 'it'],
		fallbackLng: 'en',
		debug: true,
		interpolation: {
			escapeValue: false, // React already escapes by default
		},
		backend: {
			loadPath: '/locales/{{lng}}/{{ns}}.json', // Adjust if needed
		},
		detection: {
				order: ['localStorage', 'navigator'],
				lookupLocalStorage: 'i18nextLng',
				caches: ['localStorage'],
		},
	});

i18n.on('languageChanged', (lng) => {
	localStorage.setItem('i18nextLng', lng);
});

export default i18n;

