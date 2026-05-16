"use client"

import { useTranslation } from "react-i18next"
import { Toggle } from "@Components/index"

export function LanguageToggle() {
  const { i18n } = useTranslation()

  const isNepali = i18n.language === "np"

  const handleToggle = () => {
    i18n.changeLanguage(isNepali ? "en" : "np")
  }

  return (
    <Toggle
      pressed={isNepali}
      onPressedChange={handleToggle}
      aria-label="Toggle language"
      className="px-3"
    >
      {isNepali ? "NP" : "EN"}
    </Toggle>
  )
}