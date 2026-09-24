---
name: passwordless-frontend
description: Use when implementing or changing Next.js pages, WebAuthn browser ceremonies, Google sign-in, recovery UI, authenticated security settings, or API interaction in passkey-front.
---

# Passwordless Frontend

Before editing, read `docs/FRONTEND_IMPLEMENTATION.md`, `../PASSWORDLESS_IMPLEMENTATION_PLAN.md`, and `../DEPLOYMENT_AND_DEVELOPMENT_ARCHITECTURE.md`.

## Product boundary

- This is a passwordless portfolio. Never render password inputs, password reset flows, or password-related copy.
- Public pages are landing, create account, sign in, and recovery.
- After authentication, the product is intentionally small: a simple Home security overview plus Security settings and a minimal Profile page. Do not add business features.
- The UI may not imply that Google email is a recovery email or that matching emails link accounts.

## Authentication behavior

- Use `@simplewebauthn/browser` only for browser ceremonies and let the API perform all verification.
- Use API requests with `credentials: 'include'`; never read or store a session token in JavaScript, localStorage, or sessionStorage.
- Present `Continue with Google` as one unified action; do not expose whether it will register or sign in.
- Treat recovery as access restoration. A recovery session can only create a passkey or connect Google, not enter the normal app.
- Sensitive actions must handle the backend step-up-required response by opening the step-up flow, then retry only after successful verification.

## UI direction

- Preserve a concise portfolio interface: public educational landing, compact top bar, narrow sidebar, and clear security status.
- Provide pending, success, error, expired, and retry states for every ceremony and email proof.
- Never expose raw OTPs, Magic Link tokens, recovery codes after the initial display, or sensitive backend error detail.
- Keep text and technical identifiers in English in the application UI and source code.

## Delivery checks

Verify desktop and mobile behavior, keyboard navigation, error focus, and the relevant Playwright path. Do not create an interface that allows removing the last sign-in method; show the backend rejection clearly.
