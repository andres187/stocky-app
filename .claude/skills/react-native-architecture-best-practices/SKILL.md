---
name: react-native-architecture-best-practices
description: Checklist of React Native/Expo application-architecture best practices (folder structure, navigation layering, state ownership, data layer) — distinct from react-native-best-practices, which is code-level (hooks, FlatList, safe-area). Use when deciding where new mobile code should live, restructuring the app, adding a new cross-cutting concern (a new context, a new nested navigator), or when asked to "review the mobile architecture" or "audit project structure".
---

# React Native / Expo application architecture best practices

This is about *how the app is shaped* — where things live and why — not individual hooks/component correctness (see `react-native-best-practices` for that). Use it proactively when adding something that doesn't obviously belong in an existing file, and reactively when asked to audit the project's structure.

## Checklist

1. **Update against `main`/`origin` before starting an architectural change.** Navigation types and shared contexts are exactly the files most likely to conflict across parallel work — rebase/merge onto latest `main` first so a structural decision isn't made against a stale route table or context shape.
2. **Folder structure reflects a consistent organizing principle, applied uniformly** — this project is type-based (`screens/`, `components/`, `context/`, `lib/`, `navigation/`); a new feature should extend that pattern (`screens/account/`, `screens/auth/` as sub-groupings), not introduce a competing feature-based tree alongside it.
3. **Screens compose, they don't implement.** A routed screen (`src/screens/**/*.tsx`) should mostly assemble smaller components and wire up data/navigation; heavy inline logic (complex derived state, big JSX trees) is a sign a component should be extracted to `src/components/`.
4. **Navigation is centralized in `src/navigation/`.** `RootNavigator.tsx` + `types.ts` are the single source of truth for the route table and its param types — a screen should never define ad-hoc navigation logic that bypasses the typed navigator.
5. **Global state (Context) is reserved for what's genuinely app-wide**, one responsibility per context (`AuthContext` for the session, `CartContext` for the cart, `ProductsContext` for the catalog) — not one giant app-state context. Provider order in `App.tsx`/`index.ts` encodes real dependencies (e.g. anything reading the customer's identity must be nested under `AuthProvider`) and that nesting should be documented, not tribal knowledge.
6. **There's one narrow layer between screens and the network** — `src/lib/api.ts`'s `apiFetch` is that layer; a new network call should go through it (or a thin wrapper in `src/lib/`, mirroring `orders.ts`/`reviews.ts`/`wompi.ts`), never a raw `fetch` scattered inside a screen. This is what makes changing auth/error handling a one-file change.
7. **Server state and client/UI state are not managed the same way.** Fetched data (products, orders, reviews) has its own lifecycle (loading/error/refetch) distinct from local UI state (form fields, a modal's open/closed flag) — collapsing them into the same `useState` bag makes loading/error handling inconsistent across screens.
8. **Local persistence is centralized per concern.** `src/lib/session.ts` owns the auth token in `AsyncStorage`; the cart has its own persisted key. A new feature needing persisted local state should get its own small module in `src/lib/`, not inline `AsyncStorage` calls scattered across screens/contexts.
9. **The mobile app's business rules stay in sync with the web app's, deliberately.** Shared domain logic that must match across `../movil` and `../web` (shipping cost thresholds, cart line identity, pricing) should be treated as one spec implemented twice, not organically diverged — when auditing, compare against the web equivalent when one exists.
10. **Nested navigators/tab structures follow the app's actual access model** — an authenticated-only area (account/orders/reviews) should be gated at the navigator level (redirect to sign-in) the same way `RequireAdmin`/`RequireCustomer`-style guards work on the web, not re-checked ad hoc inside every screen.
11. **The dependency direction is one-way and acyclic** — `screens` can depend on `components`, `context`, and `lib`; `components` shouldn't import from `screens`; `lib` shouldn't import from either. If two modules need each other, extract a third module for the shared thing.
12. **Naming makes the layer obvious at a glance** — `ProductCard.tsx` is presentational, `AuthContext.tsx` is state, `api.ts` is the network layer, consistent with the web project's conventions.
13. **The architecture has an explicit "next scaling step" in mind** — e.g. "if navigation param drilling gets deep, reach for a typed navigation hook per stack" — even if not taken yet, knowing the next lever separates deliberate simplicity from not having thought about it.

## How to audit with this skill

When asked to audit this project's React Native architecture:

1. Read `App.tsx`/`index.ts` (composition root, provider nesting) and `src/navigation/RootNavigator.tsx` (route table, guards), then survey `src/screens/`, `src/components/`, `src/context/`, `src/lib/` for how consistently the organizing principle (#2) and layering (#3, #6, #11) hold up — sample across the whole tree, not just the newest code.
2. Where relevant, cross-check against `../web`'s equivalent module (see #9) to confirm shared business rules haven't drifted.
3. Note where a pattern that's *fine at this size* would become a problem at 3-5x the current scope — call that out explicitly rather than flagging it as a current defect.
4. Produce a report, one row per checklist item, in this format:

```
### N. <short item name>
**Status:** ✅ Cumple / ⚠️ Parcial / ❌ No cumple
**Evidencia:** <file path>[:line] — what you found
**Por qué importa / riesgo:** <1-2 sentences, only if not fully compliant>
```

5. Do not modify code during an audit unless explicitly asked to — the audit is a report, not a refactor.
