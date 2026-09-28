# Demo deployment

1. Import this repository into Vercel as a Next.js project.
2. Set `NEXT_PUBLIC_API_ORIGIN=https://api.<ROOT_DOMAIN>` for production.
3. Assign `app.<ROOT_DOMAIN>` and wait for HTTPS to become active.
4. Do not expose database, SMTP, Google client secret, Session, or CSRF values
   to Vercel. Only `NEXT_PUBLIC_API_ORIGIN` is required by the browser.
5. Configure the Render backend with
   `FRONTEND_ORIGIN=https://app.<ROOT_DOMAIN>` and the same WebAuthn origin.

After deployment, run:

```bash
PLAYWRIGHT_BASE_URL=https://app.<ROOT_DOMAIN> npm run test:e2e
```

The automated suite uses controlled API doubles. Complete a separate manual
HTTPS pass for real platform Passkeys, cross-device Passkeys, Google OAuth,
Resend delivery, and cookie/CORS behavior. Vercel and the other demo providers'
free tiers may pause or throttle without warning.
