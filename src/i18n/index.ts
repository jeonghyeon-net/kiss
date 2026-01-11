import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import it from './locales/it.json'
import vi from './locales/vi.json'
import th from './locales/th.json'
import ar from './locales/ar.json'

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  zh: { translation: zhCN },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  ru: { translation: ru },
  it: { translation: it },
  vi: { translation: vi },
  th: { translation: th },
  ar: { translation: ar },
}

function getLanguage(): string {
  const lang = navigator.language
  if (lang in resources) return lang
  const shortLang = lang.split('-')[0]
  if (shortLang && shortLang in resources) return shortLang
  return 'en'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
