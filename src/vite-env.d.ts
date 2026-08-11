/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_ENABLE_API_MOCKS?: string
  readonly VITE_MOCK_USER_EMAIL?: string
  readonly VITE_MOCK_USER_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
