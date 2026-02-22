# Specification

## Summary
**Goal:** Fix staff portal authentication to allow login with vijaya credentials.

**Planned changes:**
- Fix backend authenticateStaff method to properly validate username 'vijaya' with password 'vijaya'
- Ensure staff user 'vijaya' exists in backend storage with correct credentials and activated status
- Verify StaffLoginForm component correctly handles authentication response and token storage

**User-visible outcome:** Staff can successfully log in to the staff portal using username 'vijaya' and password 'vijaya' without receiving unauthorized errors, and are properly redirected to the appointments page.
