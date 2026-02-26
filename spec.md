# Specification

## Summary
**Goal:** Add Privacy Policy and Terms of Service static pages with footer links to the Global Nexus platform.

**Planned changes:**
- Create a `/privacy` route rendering a Privacy Policy page with 9 sections (Introduction, Data Collection, User Consent, Data Usage, Legal Compliance, Data Security, User Rights, Transparency & Updates, Contact), styled with the Global Nexus blue (#1A6FBF) and black (#1a1a1a) theme
- Create a `/terms` route rendering a Terms of Service page with 11 sections (Acceptance of Terms, User Responsibilities, Content Submission, Community Standards, Platform Use, Data & Privacy, Legal Compliance, Limitation of Liability, Termination, Updates to Terms, Contact), styled with the same theme
- Both pages display legal text in English only, with the Hindi/English language toggle UI remaining visible and functional
- Register both `/privacy` and `/terms` routes in App.tsx
- Update the site footer to add "Privacy Policy" and "Terms of Service" links alongside the existing "About" link, navigating to `/privacy` and `/terms` respectively

**User-visible outcome:** Users can navigate to dedicated Privacy Policy and Terms of Service pages from the footer, with both pages matching the site's blue-black theme and keeping the language toggle intact.
