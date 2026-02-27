# Global Nexus

## Current State
- Full multilingual news platform (Hindi/English) live as Version 17
- Motoko backend with articles, citizen posts, comments, media items, role system, user registry
- Frontend: React + TypeScript + Tailwind, TanStack Router, full page set
- Admin principal `zp4yw-opure-zd32q-abgvl-2uyfg-abiqw-tqwyy-hej2s-mzler-4n37y-dqe` bootstrapped in `initialize()` but admin access not working reliably due to corrupted canister state from repeated failed deployments
- PWA configured (manifest.json, service worker)
- All features: homepage, breaking news ticker, carousel hero, 6 category sections with seeded articles, citizen journalism, multimedia, unified role-adaptive dashboard, About/Founder page, Privacy Policy, Terms of Service, footer with domain + contact email

## Requested Changes (Diff)

### Add
- Nothing new — final version is a clean rebuild of everything already planned

### Modify
- **Backend**: Complete clean rewrite from scratch — same API surface, same seed data, same admin bootstrap logic, but all code regenerated fresh to eliminate any state corruption or compile errors
- **Admin bootstrap**: Ensure `zp4yw-opure-zd32q-abgvl-2uyfg-abiqw-tqwyy-hej2s-mzler-4n37y-dqe` is hardcoded and inserted into both the `userRegistry` map AND the `AccessControl` state at `initialize()` time with zero possibility of trapping
- **Frontend**: Ensure `useMyProfile` and dashboard role detection work correctly for the bootstrapped admin principal

### Remove
- Nothing

## Implementation Plan
1. Generate clean Motoko backend with:
   - All same types: Article, CitizenPost, Comment, MediaItem, UserProfile, UserRegistryEntry
   - All same query/mutation functions
   - `initialize()` with bulletproof admin bootstrap for the hardcoded principal
   - Full seed data (12 articles across all 6 categories + 14 media items)
2. Fix frontend: ensure dashboard correctly reads `myProfile.role` and shows admin view for `UserRole.admin`
3. Verify no TypeScript errors in key dashboard/auth flows
4. Deploy and publish

## UX Notes
- Global Nexus branding: blue (#1A6FBF), black (#1a1a1a), white
- Logo: /assets/logo.png in nav and footer
- Founder page: Pawnesh Kumar Singh with full bio at /about
- Footer: pawneshkumarsingh@globalnexus.co.in and globalnexus.co.in
- PWA: manifest.json + service worker for mobile installability
- Hindi/English language toggle throughout
