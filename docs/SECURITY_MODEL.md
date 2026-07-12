# Security model

All external input is Zod-validated. Secrets are server-only. URL checks reject unsafe address classes. Suspected secrets are reported with filename, line and redacted preview. Admin actions require an authenticated server-side allowlist/RLS role check before activation.
