# Decant shop storefront: project rules

Source of truth for requirements: `docs/requirements.md` (v1.0). Cite requirement IDs (FR-x, NFR-x) in TODOs and commit messages. If a requirement is unclear, ask. Never invent product facts (names, prices, copy); use [Bracketed placeholders].

## Product
Online shop selling 10ml fragrance decants and discovery sets (3 decants). One size only: no size selector. Journey: Try it first, Love it, Own it. Full bottles are a later phase: leave room for them in the data model, do not build them.

## Stack (decided)
Next.js App Router (latest stable), TypeScript strict, Tailwind CSS v4, shadcn/ui on Radix, zustand for cart state, Playwright for e2e. Package manager: npm. Do not add another UI library (no MUI) or an animation library. Prefer CSS over JavaScript.

## Architecture
- Frontend only. The backend is undecided and is NOT part of this repo.
- UI code gets data only through `ShopApi` in `src/lib/data/api.ts` (`getShopApi()`). Today that is the mock adapter in `src/lib/data/mock/`. Never call fetch to a backend from a component, and never import mock data directly in UI code.
- Server components by default. Add "use client" only for interactivity (menu, cart, forms) and keep client components small.
- Money is in minor units; currency is "XXX" until the market is confirmed.

## Mobile first (hard rule)
- Design and build at 360 to 390px first. Unprefixed Tailwind classes are the phone styles; md: (768), lg: (1024), xl: (1280) only add to them.
- No horizontal scroll from 320 to 1920px. Touch targets at least 44px (min-h-11).
- Check every UI change at 390px and at 1280px before calling it done.

## Design: Night Vetiver (dark only)
- Use semantic tokens only: bg-background, bg-card, text-foreground, text-muted-foreground, border-border. No hex values in components. No pure white anywhere.
- The brand accent is `primary` and is for primary actions only (Add to cart, main CTA). shadcn's `accent` token is just a hover background.
- Minimal pages: one clear purpose per section. Font: DM Sans via next/font.
- Never add: carousels or sliders (client requirement), autoplay, unsolicited popups or modals, third-party scripts.

## Performance and quality
- next/image with sizes, fixed aspect ratios, priority on the hero image only. Self-hosted fonts. Paginate lists.
- Accessibility: semantic landmarks, labelled controls, visible focus, respect prefers-reduced-motion, text contrast at least 4.5:1.
- SEO: per-page metadata, JSON-LD on product pages, noindex on cart, checkout and order pages.

## Working agreements
- Work in small milestones. When a milestone is done: run `npm run lint`, `npx tsc --noEmit` and `npm run build`, fix everything, commit (conventional commits), report, and STOP. Do not start the next milestone.
- Do not rewrite or reformat files you were not asked to touch. Keep TODO comments that reference requirement IDs.
- No `any`. No secrets in code. No new dependency without saying why.
