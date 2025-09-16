import Backend from 'i18next-fs-backend';
import i18next from 'i18next';
import path from 'path';

export async function initI18n(defaultLang = 'en') {
	await i18next
	  .use(Backend)
	  .init({
	    lng: defaultLang,
	    fallbackLng: 'en',
	    backend: {
	      loadPath: path.join(process.env.TRANSLATION_FOLDER!, '{{lng}}/translation.json'),
	    },
			interpolation: {
    		escapeValue: false,
  		},
	  });
	return i18next;
}

export async function setLanguage(lang: string) {
	await i18next.changeLanguage(lang);
	console.log(i18next);
}
