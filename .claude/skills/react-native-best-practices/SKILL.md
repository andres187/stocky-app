---
name: react-native-best-practices
description: Checklist of React Native/Expo best practices (hooks, navigation, platform APIs, performance, offline/async storage) for writing new mobile code in this project or auditing existing screens/components/contexts against the checklist. Use when writing, reviewing, or auditing any .tsx/.ts file in src/, or when asked to "review React Native code", "audit the mobile app", or "check best practices".
---

# React Native / Expo best practices

Use this checklist both proactively (while writing new mobile code) and reactively (when asked to audit existing code). Each item explains *why* it matters, not just what to do. Before writing any code, re-read `AGENTS.md` at the project root — it points at the exact versioned Expo docs (v57) for this project, since Expo APIs change fast and generic/remembered knowledge goes stale quickly.

## Checklist

1. **Update against `main`/`origin` before starting work.** Run `git fetch` + rebase/merge onto the latest `main` before writing new code, and re-sync before opening a PR — Expo SDK upgrades and navigation/type changes land fast, and starting from a stale branch is a common source of avoidable merge conflicts and "already fixed" bugs.
2. **Hooks follow the rules of hooks** — no hooks inside conditionals, loops, or after an early return; identical hook call order every render, same as web React.
3. **`useEffect`/`useMemo`/`useCallback` dependency arrays are complete and correct** — a stale closure inside a `useEffect` that calls `apiFetch` or reads `AsyncStorage` is a common source of "shows old data" bugs, especially with `useFocusEffect` re-firing on every screen focus.
4. **Navigation types are exhaustive and used everywhere they route.** `RootNavigator`/`types.ts` should stay the single source of truth for every route name and its params — a `navigation.navigate('SomeScreen')` with a typo or missing param should be a compile error, not a runtime crash on tap.
5. **Screens handle loading/error/empty states explicitly**, same reasoning as web, but more visible here: a screen that silently shows nothing while `apiFetch` is pending or has failed looks broken to a mobile user who can't open devtools to check — always render a distinct spinner/error/retry state.
6. **Async persistence (`AsyncStorage`) is never assumed to succeed synchronously** — every read/write is a `Promise`; a missed `await` (e.g. clearing the cart or token) leaves stale state that resurfaces on next app open. Failures should be caught, not left to reject unhandled (see `AuthContext`'s `clearToken().catch(() => {})` pattern for a non-critical cleanup).
7. **Lists use `FlatList`/`SectionList` with a stable `keyExtractor`**, not a `.map()` inside a `ScrollView`, for anything that can grow (product grids, order history) — `ScrollView` renders every item up front and has no virtualization, which becomes a real perf/memory problem as data grows.
8. **Platform differences are handled deliberately**, not ignored — `Platform.OS`/`Platform.select` for anything that behaves differently on iOS vs Android (safe-area insets, keyboard avoidance, permissions prompts), and tested against both mentally even without two devices on hand.
9. **Safe-area and keyboard-avoiding views wrap any screen with a header or a form** — `react-native-safe-area-context` (already a dependency) for notches/status bars, `KeyboardAvoidingView`/`ScrollView` for forms so inputs aren't hidden behind the keyboard. A regressed header overlapping the status bar has already happened once in this project.
10. **Environment/config values come from `process.env.EXPO_PUBLIC_*`, never hardcoded** — same discipline as the web project's `import.meta.env`, e.g. `EXPO_PUBLIC_API_URL` in `src/lib/api.ts`.
11. **Images and assets are sized/optimized for mobile bandwidth** — avoid shipping or fetching full-resolution web images unresized; use `resizeMode` deliberately and prefer a CDN-resized URL over a giant original when one is available.
12. **Side effects clean up on unmount** — timers, subscriptions, and any listener (keyboard, app state, navigation) started in `useEffect` must return a cleanup function, since screens mount/unmount far more often than web pages do (every navigation push/pop).
13. **No business logic duplicated between screens** — shared logic (pricing, shipping cost, cart line identity) belongs in `src/lib/` or a context, mirrored 1:1 with `../web`'s equivalents where the domain rules must match (e.g. shipping threshold, cart line key format) rather than reimplemented per screen.
14. **TypeScript types are not widened away** — avoid `any`/unnecessary `as` casts on API responses; `src/lib/types.ts` should reflect what the backend actually returns, and a shape mismatch should surface as a type error while writing the code, not as a runtime `undefined` on a device.
15. **Accessibility basics**: `accessibilityLabel` on icon-only touchables, adequate touch target size (≥44x44), and sensible `accessibilityRole` on custom pressable components.

## How to audit with this skill

When asked to audit React Native code against this checklist:

1. Locate the relevant source: `src/context/` (providers), `src/components/` (shared UI), `src/screens/` (routed views, including `src/screens/auth/` and `src/screens/account/`), `src/navigation/` (route table + types), `src/lib/` (API client, session, formatting).
2. Check each checklist item against the actual code — read the files, don't guess. Use `grep`/`Grep` for cross-cutting concerns (e.g. search for `.map(` inside a `ScrollView`, `AsyncStorage`, `Platform.OS`, `any`).
3. Produce a report, one row per checklist item, in this format:

```
### N. <short item name>
**Status:** ✅ Cumple / ⚠️ Parcial / ❌ No cumple
**Evidencia:** <file path>[:line] — what you found
**Por qué importa / riesgo:** <1-2 sentences, only if not fully compliant>
```

4. Do not silently skip items — if something isn't applicable to this project, say so explicitly (`N/A` with a one-line reason) rather than omitting it.
5. Do not modify code during an audit unless explicitly asked to — the audit is a report, not a refactor.
