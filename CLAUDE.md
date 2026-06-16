@AGENTS.md

# أداء (Adaa) — Store V2

Custom rebuild of adaa.store, migrating away from WordPress/WooCommerce + Elementor
to a clean, scalable, custom-coded site. Arabic (RTL) gaming PC performance‑optimization service.

> ⚠️ This repo uses **Next.js 16** (App Router, Turbopack). Some APIs differ from older
> Next.js — when unsure, check `node_modules/next/dist/docs/`.

## Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens defined in `src/app/globals.css` via `@theme`)
- Fonts via `next/font`: **IBM Plex Sans Arabic** (display) + **Cairo** (body)
- No backend yet. Accounts + subscriptions (ADAAX) are a planned later phase — keep
  data/presentation separated so they plug in cleanly.

## Conventions
- **RTL-first**: `<html dir="rtl" lang="ar">` in `src/app/layout.tsx`.
- **Server Components by default.** The homepage ships zero client JS — all motion is
  pure CSS. Only add `"use client"` when genuinely needed.
- **Design tokens are the single source of truth.** Change brand colors/fonts in the
  `@theme` block of `globals.css`; never hardcode brand hex in components (arbitrary
  values are fine for one-off effects). Brand greens: `primary #508d4e`,
  `primary-light #80af81`.
- **Content is data-driven.** Section content lives in `src/data/*.ts`, not inside JSX.
  This is the seam where a CMS/DB swaps in later. Package prices are set in USD
  (`data/packages.ts`): basic $35, premium $50, ultimate $80 (was $100).

## Routes
- `/` homepage · `/services` (خدماتنا — lists the 3 service tiers) ·
  `/packages/[slug]` detail pages (basic|premium|ultimate, SSG via `generateStaticParams`).
- Navbar is a **floating centered pill** showing pages only (الرئيسية، خدماتنا) +
  login (accounts phase) + cart button (store phase, disabled). `params` is async in
  Next 16 — `await params` in pages/metadata.
- TODO from user: Terms & Conditions + Privacy pages (designs incoming).
  "اطلب الخدمة الآن" CTA is a `#` placeholder until checkout exists.

## Layout
```
src/
  app/            layout.tsx (RTL, fonts, chrome) · page.tsx (homepage) · globals.css (tokens)
  components/
    ui/           primitives: Button, Badge, Card, Marquee, Section, Container, SectionHeading, icons
    layout/       Navbar, Footer
    sections/     Hero, ProcessSteps, GamesMarquee + reviews/, packages/, tech/ subfolders
  data/           reviews, processSteps, packages, games, techStats, chartPaths
  lib/            utils (cn)
public/           brand/ · packages/ · games/ · reviews/   (self-hosted assets)
```
`Desgins/` (note spelling) holds source brand art — reference only, not shipped.

## Commands
- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build + type-check + lint
- `npm run lint` — ESLint

## Homepage section order
Hero → Reviews (dual marquee) → ProcessSteps → Packages → GamesMarquee → TechStats → Footer
