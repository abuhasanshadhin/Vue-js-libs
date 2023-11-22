import { defineStore } from 'pinia';

const transStore = defineStore('i18nStore', {
    state: () => ({ translations: {} }),
    actions: {
        setTranslations(lang) {
            this.translations = lang;
        },
    },
});

const localStore = {
    setLocale(locale) {
        return localStorage.setItem('locale', locale);
    },
    getLocale() {
        return localStorage.getItem('locale');
    },
    setLang(lang) {
        const json = JSON.stringify(lang);
        return localStorage.setItem('lang', json);
    },
    getLang() {
        const lang = localStorage.getItem('lang');
        return lang ? JSON.parse(lang) : {};
    },
}

const getTranslations = async (basename) => {
    const module = await import(`../lang/${basename}.json`);
    return module.default;
}

const translator = (key, attrs = {}) => {
    const store = transStore();
    
    let trans = String(key).split('.').reduce((p, c) => {
        if (p instanceof Object) return p[c];
    }, store.translations);

    if (trans && Object.keys(attrs).length) {
        const matches = String(trans).match(/(:\w+)/g);

        if (matches && Array.isArray(matches)) {
            matches.forEach(match => {
                const attr = String(match).slice(1);
                const replace = attrs[attr] || '';
                trans = String(trans).replace(match, replace);
            });
        }
    }

    return trans || key;
}

export const setLocale = async (locale) => {
    const store = transStore();
    const translations = await getTranslations(locale);
    store.setTranslations(translations);
    localStore.setLocale(locale);
    localStore.setLang(translations);
}

export const getLocale = (locale = '') => {
    const current = localStore.getLocale();
    return locale ? locale === current : current;
}

const plugin = {
    install(app, options = {}) {
        const {
            default: {
                locale = 'en',
                lang = {}
            } = {}
        } = options;

        const store = transStore();
        const currentLocale = getLocale();
        const lsLang = localStore.getLang();

        if (currentLocale && lsLang) {
            store.setTranslations(lsLang);
            getTranslations(currentLocale)
                .then(svLang => {
                    const svLangJson = JSON.stringify(svLang);
                    const lsLangJson = JSON.stringify(lsLang);

                    if (svLangJson !== lsLangJson) {
                        store.setTranslations(svLang);
                        localStore.setLang(svLang);
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            localStore.setLocale(locale);
            store.setTranslations(lang);
            localStore.setLang(lang);
        }

        app.config.globalProperties.$trans = translator;
    }
}

export default plugin;