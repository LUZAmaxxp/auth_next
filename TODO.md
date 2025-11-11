# i18n Implementation Plan

## Current State Analysis
- Next.js app with next-intl for i18n
- 4 languages: en, fr, es, ar
- I18nProvider sets initial locale to 'fr'
- Settings page allows language change
- Language stored in localStorage and settings store
- Auth pages use separate translation system

## Issues Identified
- i18n.ts defaults to 'en' instead of 'fr'
- Settings store initial language is 'en-US' instead of 'fr'
- Language change needs to persist globally
- Need to ensure all pages use i18n context

## Tasks
- [ ] Update i18n.ts default locale to 'fr'
- [ ] Update settings-store initial language to 'fr'
- [ ] Ensure language change applies to all pages
- [ ] Verify JSON files are complete
- [ ] Test language switching functionality
- [ ] Update layout to use dynamic locale
- [ ] Ensure middleware handles locale properly

## Files to Modify
- i18n.ts
- src/lib/settings-store.ts
- src/app/layout.tsx
- middleware.ts (if needed)
- Verify all page components use useTranslation or useI18n
