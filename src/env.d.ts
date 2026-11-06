/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OMDb API key (https://www.omdbapi.com/apikey.aspx). Set in .env.local. */
  readonly VITE_OMDB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
