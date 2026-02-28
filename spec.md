# Global Nexus Final Presentation

## Current State
- Admin dashboard at `/admin` with Article Management (create/delete only) and Post Moderation tabs
- Multimedia page at `/multimedia` showing videos, podcasts, reels — but no admin upload/management UI
- About Us, Privacy Policy, Terms of Service pages are hardcoded in frontend React files — no admin editing
- Role system: admin, user, guest — only admin can create articles
- No article editing capability (only create + delete)
- No media item management from admin panel (no create/delete media)

## Requested Changes (Diff)

### Add
- Backend: `updateArticle(id, fields...)` — admin or editor can update any field of an existing article
- Backend: `createMediaItem(mediaType, title, embedUrl, thumbnailUrl, fileData?)` — admin or editor can add media
- Backend: `deleteMediaItem(id)` — admin or editor can remove media items
- Backend: `getPageContent(pageKey)` / `savePageContent(pageKey, content)` — store About Us, Privacy Policy, Terms editable content in backend
- Frontend: Multimedia Management tab in Admin Dashboard — form to upload actual files (MP4, audio, image for thumbnail) OR paste URL, with file→base64 conversion, type/size validation, and delete button per item
- Frontend: Article edit mode — clicking an article row in the management table opens an inline edit form pre-filled with current values
- Frontend: Page Content Editor tab in Admin Dashboard — three sub-tabs (About Us, Privacy Policy, Terms of Service) each with a rich textarea the admin/editor can update and save, which then renders on the public pages
- Frontend: All above features accessible to users with `admin` role OR `user` role (editor/writer delegation)

### Modify
- Backend: `createArticle`, `deleteArticle`, `createMediaItem`, `deleteMediaItem`, `updateArticle`, `savePageContent` — allow callers with `#admin` OR `#user` role (not just admin)
- Frontend: AdminDashboardPage — add two new tabs: "Multimedia" and "Pages"
- Frontend: ArticleManagement — add Edit button per row; edit form replaces create form when editing
- Frontend: AboutPage, PrivacyPolicyPage, TermsOfServicePage — fetch content from backend `getPageContent` and fall back to hardcoded defaults if not yet saved

### Remove
- Nothing removed

## Implementation Plan
1. Extend Motoko backend:
   - Add `PageContent` type and `pageContents` map keyed by Text (e.g. "about", "privacy", "terms")
   - Add `getPageContent(key)` public query
   - Add `savePageContent(key, content)` — requires admin or user role
   - Add `updateArticle(id, ...fields)` — requires admin or user role
   - Add `createMediaItem(mediaType, title, embedUrl, thumbnailUrl)` — requires admin or user role
   - Add `deleteMediaItem(id)` — requires admin or user role
   - Update `createArticle` and `deleteArticle` to allow user role too
2. Frontend hooks: add `useUpdateArticle`, `useCreateMediaItem`, `useDeleteMediaItem`, `useGetPageContent`, `useSavePageContent`
3. Admin Dashboard: add "Multimedia" tab with upload form (file upload + URL option, base64 conversion, validation) and media list with delete
4. Admin Dashboard: add "Pages" tab with three sub-tabs for About/Privacy/Terms — each with a large textarea pre-loaded from backend, Save button
5. ArticleManagement: add Edit button per row; clicking opens edit form pre-filled, with Update button
6. Public pages (AboutPage, PrivacyPolicyPage, TermsOfServicePage): fetch from `getPageContent`, show backend content if available, else show hardcoded default
