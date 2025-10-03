import Backend from 'i18next-fs-backend';
import i18next from 'i18next';
import path from 'path';


export async function initI18n(): Promise<void> {
	await i18next.use(Backend)
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
}

export function t(key: string, options?: any): string {
	const message = i18next.t(key, options);
	return String(message);
}