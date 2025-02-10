/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_DEFAULT_WARNING_DAYS: string
  readonly VITE_APP_PAGE_SIZE: string
  readonly VITE_APP_DATE_FORMAT: string
  readonly VITE_APP_CURRENCY_SYMBOL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 