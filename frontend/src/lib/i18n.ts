import i18n from "i18next"
import { initReactI18next } from "react-i18next"

// import JSON files
import common_en from "@/locales/en/common.json"
import auth_en from "@/locales/en/auth.json"

import common_np from "@/locales/np/common.json"
import auth_np from "@/locales/np/auth.json"

i18n
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",

    resources: {
      en: {
        common: common_en,
        auth: auth_en,
      },
      np: {
        common: common_np,
        auth: auth_np,
      },
    },

    ns: ["common", "auth"], // namespaces
    defaultNS: "common",

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n