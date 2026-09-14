---
name: mobile-login-security-best-practices
description: Checklist of mobile-app security best practices, focused on session/token handling and secure error handling (never leaking internals, stack traces, or sensitive data through UI/logs/crash reports) for building or auditing auth flows and network error handling in this Expo/React Native app. Use when writing or changing anything related to auth/token/session/OTP, any try/catch around a network call, or when asked to "review mobile security", "audit error handling", or "check auth best practices" on the mobile app. Complements login-security-best-practices (the web/backend version) and the installed claude-security skill.
---

# Mobile security & error-handling best practices

Use this checklist both proactively (while building or changing auth flows and network calls) and reactively (when asked to audit the existing mobile app). A mobile client has a different threat model from a browser tab: the device can be lost/stolen, inspected while unlocked, or run alongside malicious apps — and it ships with real crash/log tooling that can leak more than intended if not handled carefully. Each item explains *why* it matters.

## Checklist — session & token handling

1. **The session token is stored in a mechanism appropriate to its sensitivity.** This app stores the customer JWT (`src/lib/session.ts`) in `AsyncStorage`, which is unencrypted on-disk storage — acceptable for a low-privilege customer session, but a deliberate trade-off, not a default to copy blindly onto anything more sensitive (e.g. a future payment credential or biometric key belongs in `expo-secure-store`, which is backed by Keychain/Keystore).
2. **Tokens are never logged**, not even in a `console.log` during development — `console.log(token)` or logging a full request/response object that includes an `Authorization` header is easy to leave in accidentally and easy to forget to remove before merging.
3. **A token is cleared on any authentication failure, not just on explicit logout.** `AuthContext`'s pattern of clearing the token when `/customer-auth/me` fails on app start (expired/invalid token) is the right shape — a stale or rejected token should never linger in storage waiting to be resent.
4. **The app has no server-controlled remote revocation gap it isn't aware of.** A JWT is valid until it expires no matter what the client does; if the backend needs to force-revoke a mobile session (e.g. seller/admin status change on the web side, `requireSellerAuth` re-reading status per request), confirm the mobile-facing endpoint the app calls has equivalent behavior — don't assume "cleared locally" means "invalid everywhere."
5. **OTP codes and other short-lived secrets never persist longer than the flow needs them.** A verification code entered in `VerifyCodeScreen` should live only in local component state, never written to `AsyncStorage` or any persisted store.
6. **Deep links / universal links that can carry auth-relevant data (a magic link, a code) are validated before use**, not trusted as-is — a malicious app or a modified link should not be able to smuggle an unexpected value into the auth flow.

## Checklist — error handling

7. **A caught error's message shown to the user is never the raw error passed through untouched**, when that error could come from somewhere other than the backend's deliberate, user-facing message field. `AuthContext`'s `errorMessage()` helper (falls back to a generic Spanish message for anything that isn't an `Error` with a message) is the right shape — but check the message assigned to that `Error` upstream isn't itself something the app shouldn't show verbatim (see #8).
8. **`apiFetch`'s thrown error message comes only from the backend's own `error`/`errors` field, never a raw response body dump, a stack trace, or a generic fetch/network exception's internal text** — showing a raw `TypeError: Network request failed` or similar to a user is confusing and can leak implementation detail (library names, internal paths) without being useful.
9. **A network/parse failure (no connectivity, malformed JSON, timeout) is handled as its own case, distinct from a backend-returned error**, and shown as an actionable message ("Revisa tu conexión e intenta de nuevo") rather than whatever the underlying exception says.
10. **No sensitive data appears in a crash report or error-tracking payload.** If/when a crash reporter (Sentry, Bugsnag, or Expo's own) is added, redact or omit tokens, full request bodies, emails/phone numbers, and any OTP code from breadcrumbs and error context before it leaves the device.
11. **A failed request is never silently swallowed with an empty `catch {}` outside of a deliberate, commented "best-effort cleanup" case** (like `clearToken().catch(() => {})` in `AuthContext`, which is fine because losing that cleanup has no security consequence) — an unexplained empty catch around a security-relevant call (verifying a token, checking a status) can hide a real failure as if it succeeded.
12. **Errors surfaced to the UI never include another user's data or an internal identifier that lets one user probe for another's existence** — mirrors the backend's anti-enumeration rule (generic "correo o contraseña incorrectos"); the mobile UI must not "improve" a generic backend message by adding detail the backend deliberately withheld.
13. **`__DEV__`-only diagnostics (verbose logging, a debug panel) are actually gated on `__DEV__`/`process.env.NODE_ENV`** and cannot ship enabled in a production build — the same discipline the web project applies to `McpConsole` being `import.meta.env.DEV`-gated.
14. **Dependencies involved in auth/storage (`@react-native-async-storage/async-storage`, any future `expo-secure-store`/crypto lib) are kept current** — an outdated storage or auth-adjacent package is higher severity than an unrelated one.

## How to audit with this skill

When asked to audit mobile security/error handling against this checklist:

1. Look at `src/lib/session.ts` (token storage), `src/lib/api.ts` (`apiFetch` — the single error-normalization point), `src/context/AuthContext.tsx` (session lifecycle, error surfacing), and every `auth`/`account` screen that calls `apiFetch` directly or through the context.
2. Grep for `console.log`/`console.error` near anything touching `token`, `code`, `password`, or a full response object.
3. Grep for empty `catch` blocks and check each one is a deliberate, low-consequence case (per #11), not a hidden failure.
4. Produce a report, one row per checklist item, in this format:

```
### N. <short item name>
**Status:** ✅ Cumple / ⚠️ Parcial / ❌ No cumple
**Evidencia:** <file path>[:line] — what you found
**Por qué importa / riesgo:** <1-2 sentences, only if not fully compliant>
```

5. When a gap is a deliberate, reasonable trade-off for the project's current stage (e.g. `AsyncStorage` instead of `SecureStore` for a low-privilege customer token), say so explicitly rather than treating every gap as equally urgent.
6. Do not modify code during an audit unless explicitly asked to — the audit is a report, not a fix.
