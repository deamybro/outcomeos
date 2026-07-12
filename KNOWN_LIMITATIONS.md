# Known limitations

- Durable authentication, public receipt persistence and admin mutations require a configured Supabase project; guest mode is local to the page.
- Website redirects currently rely on the runtime follow behavior after validating the initial DNS destination; production hardening should manually validate every redirect hop and pin resolved addresses.
- GitHub checks are static and sample a bounded file set. A successful build is claimed only by the controlled workflow.
- PDF is provided through the browser print path, not a server-rendered binary PDF endpoint.
- Rate limiting is documented/configurable but needs a deployment-wide durable store for multi-instance enforcement.
- No production URL or external OKX marketplace registration exists in this local workspace.
