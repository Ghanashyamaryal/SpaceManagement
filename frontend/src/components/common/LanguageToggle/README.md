## Language System

### Using the Language Toggle

The starter kit includes multi-language support powered by **i18next** with a ready-to-use toggle component for switching languages (e.g., English and Nepali).

```tsx
import { LanguageToggle } from "@Components/common/LanguageToggle"

export default function Header() {
  return (
    <div className="flex justify-end p-4 border-b border-border">
      <LanguageToggle />
    </div>
  )
}
```

---

### Using Translations

Use the `useTranslation` hook to access translated text:

```tsx
import { useTranslation } from "react-i18next"

export default function Example() {
  const { t } = useTranslation()

  return (
    <h1>{t("welcome")}</h1>
  )
}
```

---

### Using Namespaces

Translations are organized into namespaces for scalability:

```tsx id="l9f0as"
<button>{t("auth:login")}</button>
<button>{t("auth:logout")}</button>
```

---

### Translation Structure

```bash 
locales/
  en/
    common.json
    auth.json
  np/
    common.json
    auth.json
```

---

### Extending Translations

You can add more translation keys inside the respective JSON files:

```json
{
  "register": "Register",
  "forgot_password": "Forgot Password?"
}
```

Then use them in your components:

```tsx 
t("auth:register")
t("auth:forgot_password")
```

---
