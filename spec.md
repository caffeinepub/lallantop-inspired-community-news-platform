# Global Nexus — Final Deployment Fix

## Current State
The platform is fully built with homepage, articles, citizen journalism, multimedia, role-based dashboard, privacy/terms pages, PWA, and admin assignment. The backend has two critical compilation/runtime bugs that cause deployment failures and admin access to break.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: `getUserRole` must return `#guest` (not trap) for unknown principals
- `access-control.mo`: Add `assignRoleDirectly` function that bypasses admin check
- `main.mo`: `bootstrapAdmin()` must call `AccessControl.assignRoleDirectly(accessControlState, adminPrincipal, #admin)` in addition to inserting into `userRegistry`
- `main.mo`: `initialize()` must silently return (not trap) if already initialized
- `main.mo`: Use `Nat.toText(userRegistryCounter)` not `userRegistryCounter.toText()`
- `main.mo`: No `migration` import, no `(with migration = ...)` actor decorator

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with all bugs fixed
2. Delegate frontend validation to frontend agent

## UX Notes
- Admin principal `zp4yw-opure-zd32q-abgvl-2uyfg-abiqw-tqwyy-hej2s-mzler-4n37y-dqe` must have full access to `/dashboard` after login
