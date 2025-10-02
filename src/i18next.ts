import Backend from 'i18next-fs-backend';
import i18next from 'i18next';
import path from 'path';

i18next.use(Backend)
	.init({
	  lng: 'fr',
	  fallbackLng: 'en',
	  backend: {
	    loadPath: path.join(process.env.TRANSLATION_FOLDER!, '{{lng}}/translation.json'),
	  },
		interpolation: {
  		escapeValue: false,
  	},
	});

export default i18next;
