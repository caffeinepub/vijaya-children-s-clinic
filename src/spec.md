# Specification

## Summary
**Goal:** Replace the app’s branding logo with the newly uploaded white-background logo and update the site color theme to match the logo’s blue–green palette.

**Planned changes:**
- Swap all existing logo usages (e.g., SiteHeader logo and landing hero logo) to use the newly uploaded logo image, preserving its original white background and aspect ratio.
- Ensure the logo renders crisply at common responsive breakpoints (mobile and desktop) without blur or pixelation.
- Update global theme tokens (CSS variables/Tailwind theme usage) in `frontend/src/index.css` to align with the new logo’s blue/green colors.
- Replace materially conflicting hard-coded blues/greens with theme tokens so the updated palette applies consistently across Landing, Book Appointment, and Staff pages.

**User-visible outcome:** The site displays the new Vijaya Children’s Clinic logo everywhere with its white background intact, and the UI colors across key pages match the logo’s blue–green branding consistently.
