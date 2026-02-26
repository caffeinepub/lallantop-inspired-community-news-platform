# Specification

## Summary
**Goal:** Add an admin-assigned auto-ID role system to the Motoko backend and build a unified role-adaptive dashboard on the frontend for the Global Nexus application.

**Planned changes:**
- Extend `backend/main.mo` with a stable `Principal → { autoId, role }` registry, `UserRole` variant type (`#admin`, `#writer`, `#editor`, `#publisher`), and four new functions: `assignRoleWithAutoId`, `getMyProfile`, `revokeRole`, and `getUserRegistry`; keep existing `assignRole`, `isAdmin`, and `isEditor` intact
- Add per-role monotonically incrementing stable counters generating IDs in the format `role_NNN` (e.g. `writer_001`) that survive canister upgrades
- Add a `useRoleSystem` hook file exporting `useMyProfile`, `useUserRegistry`, `useAssignRoleWithAutoId`, and `useRevokeRole` React Query hooks with appropriate cache invalidation
- Create `frontend/src/pages/DashboardPage.tsx` at route `/dashboard` with four role-adaptive views: Admin (three tabs), Writer/Editor (create/manage articles), Publisher (review/publish), and Unassigned (contact-admin message with copyable Principal ID)
- Admin view includes a **User Management** tab with an Assign Role form (Principal field + role dropdown) showing the returned auto-ID on success, and a User Registry table with auto-ID, role badge, truncated Principal ID with copy button, and Revoke action
- Admin view also includes **Article Management** and **Citizen Post Moderation** tabs reusing shared components from the existing `AdminDashboardPage.tsx`; `/admin` route remains fully functional
- Update `Layout.tsx` nav to show the user's auto-generated ID, a color-coded role badge (Admin = dark blue, Editor = green, Writer = teal, Publisher = orange), a Dashboard link, and keep the existing `PrincipalIdDisplay`; all new elements visible only when authenticated
- Add English and Hindi translation strings to `translations.ts` for all new UI strings; all new components use the existing `useTranslation` hook
- Register `/dashboard` route in `App.tsx`; unauthenticated users visiting `/dashboard` are redirected to the homepage

**User-visible outcome:** After logging in, users are routed to `/dashboard` where they see a dashboard tailored to their admin-assigned role. Admins can assign roles to principals (auto-generating unique IDs like `writer_001`), view/revoke the full user registry, and manage articles and citizen posts — all from one place. Writers/Editors can create and manage their articles, Publishers can review and publish content, and unassigned users see a prompt to contact the admin. The nav displays each user's auto-ID and role badge once a role is assigned.
