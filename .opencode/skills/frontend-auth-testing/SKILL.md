---
name: frontend-auth-testing
description: Use when writing or reviewing passkey-front component tests, Playwright tests, browser auth states, recovery screens, or accessibility for passwordless flows.
---

# Frontend Authentication Testing

Read `docs/FRONTEND_IMPLEMENTATION.md` before creating or changing tests.

## Test boundaries

- Mock browser WebAuthn and Google SDK boundaries in component tests; test real browser ceremonies only where supported by the E2E environment.
- Use API mocks for deterministic UI states and integration/E2E tests for cookie-backed authenticated navigation.
- Never include real OTPs, recovery codes, session cookies, Google tokens, or production credentials in fixtures.

## Required coverage

- Landing and public navigation contain no password UI.
- Passkey registration/login handles cancellation, challenge expiry, verification failure, and success.
- Google action remains unified and handles callback failures safely.
- Recovery supports OTP, Magic Link, and recovery code, while recovery-session routes cannot navigate to Home.
- Step-up dialog returns users to the pending sensitive action on success and preserves a usable error state on failure.
- Security screens communicate the last-method constraint, code counts, and session revocation accurately.
- Pages are usable on desktop and mobile with visible focus and accessible form errors.
