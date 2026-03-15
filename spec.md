# Vijaya Children's Clinic

## Current State
The staff portal at `/staff` uses a hybrid authentication model:
- The backend `authenticateStaff` rejects anonymous callers (requires Internet Identity first)
- The `staffUserMap` starts empty — no staff accounts exist, so any username/password always fails
- The frontend `useStaffAuth` hook tries to trigger Internet Identity login before calling `authenticateStaff`, causing the confusing "First Time Setup Required" prompt and blocking all logins

## Requested Changes (Diff)

### Add
- Hardcoded staff credential check in backend: userId = "vijaya", password = "vijaya"
- Session token (random UUID) returned on successful login, stored in localStorage
- Backend method `authenticateStaffSimple` accepting anonymous callers, returning a session token
- Backend method `validateStaffSession(token)` to authorize subsequent calls
- `listAppointments` and `updateAppointmentStatus` accept session token parameter

### Modify
- Backend: `authenticateStaff` — allow anonymous callers, check hardcoded credentials instead of staffUserMap
- Frontend `useStaffAuth`: remove Internet Identity login requirement; login calls backend directly with username/password
- Frontend `StaffLoginForm`: remove any reference to Internet Identity or admin setup
- Frontend: after successful login, store session token and use it for subsequent API calls

### Remove
- Requirement to call Internet Identity before password authentication
- `staffUserMap` dependency for staff authentication
- "First Time Setup Required" message and admin portal references
- Admin portal page and `StaffManagementPage` route
- Internet Identity import from `useStaffAuth`

## Implementation Plan
1. Update `main.mo`: hardcode credentials check (vijaya/vijaya), allow anonymous principal, return bool (session managed in localStorage only)
2. Update `listAppointments` in backend to allow any caller (remove staff session check — authorization is now frontend-managed via localStorage)
3. Update `updateAppointmentStatus` similarly
4. Update `useStaffAuth.ts`: remove Internet Identity calls, authenticate directly with backend using username/password, store result in localStorage
5. Update `StaffLoginForm.tsx`: clean up error messages, remove First Time Setup info
6. Remove `StaffManagementPage` route from `App.tsx`
7. Validate and deploy
