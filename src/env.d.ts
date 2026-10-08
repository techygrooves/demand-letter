/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Intake submission provider: "none" (default), "endpoint" or "demo". See src/lib/intake/submit.ts. */
  readonly PUBLIC_INTAKE_PROVIDER?: string;
  /** HTTPS URL that receives intake submissions as JSON when PUBLIC_INTAKE_PROVIDER=endpoint. */
  readonly PUBLIC_INTAKE_ENDPOINT?: string;
  /** Allow the demo provider in a production build (for staging/testing only). */
  readonly PUBLIC_INTAKE_ALLOW_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
