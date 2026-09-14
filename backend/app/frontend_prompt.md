# CloudTrace Frontend — Complete Build Specification

## Tech stack
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS for styling
- Backend API: FastAPI running at `http://localhost:8000` (dev) — base URL should be an environment variable (`NEXT_PUBLIC_API_URL`) so it can point to a different host later without code changes.

## Core concept
This is a chain-of-custody evidence system with **four roles**, each seeing a different dashboard:
- **Admin** — approves new users, assigns roles, has full visibility
- **Investigator** — uploads evidence, views/verifies only evidence they uploaded
- **Custodian** — same access pattern as investigator (handles evidence custody)
- **Auditor** — read-only, but can view and verify ANY evidence (full compliance visibility)

New users who sign up have **zero access** until an admin approves them. This must be reflected clearly in the UI (a "pending approval" state, not just an error).

---

## 1. Authentication pages

### `/signup`
- Fields: email, password (plus a confirm-password field for UX, not sent to API)
- On submit: `POST /auth/signup` with `{ email, password }` — **do not** send a role field, the API ignores/rejects it anyway
- On success: show a clear message — *"Account created. An administrator must approve your account before you can log in."* Do not redirect to a dashboard. Do not attempt auto-login.

### `/login`
- Fields: email, password
- On submit: `POST /auth/login` as `application/x-www-form-urlencoded` with `username` (the email) and `password` — this is OAuth2PasswordRequestForm format, not JSON
- On success: response is `{ access_token, token_type }`. Store `access_token` (see Auth State below). Decode the JWT payload (it contains `role` and `sub` = user id) to know which dashboard to route to, OR just redirect to a single `/dashboard` route that self-determines layout by role.
- On 403 with detail `"Your account is pending admin approval..."` — show this message clearly and distinctly from a wrong-password error. Don't just show a generic "login failed."
- On 401 — show "Incorrect email or password."

---

## 2. Auth state & API client

- Store the JWT in React state at the top of the app (e.g., a Context provider) — **not** localStorage/sessionStorage in any Claude-artifact context, but for your real Next.js app outside this tool, a secure httpOnly cookie is best practice; a simple approach for a student project is an in-memory context that re-prompts login on page refresh, or localStorage if simplicity is prioritized over hardening.
- Decode the JWT (a plain base64 decode of the payload segment is enough — no need for a full JWT library) to extract `role` and `sub` (user id), and `exp` to detect expiry.
- Build a small `apiFetch(path, options)` wrapper that automatically attaches `Authorization: Bearer <token>` to every request, and handles 401 responses by logging the user out and redirecting to `/login`.

---

## 3. Role-based dashboard shell

A single `/dashboard` layout that:
- Shows a sidebar or top nav with links that differ by role (see below)
- Shows the logged-in user's email and role in a header
- Has a Logout button (clears stored token, redirects to `/login`)

### Nav items by role

| Role | Visible sections |
|---|---|
| Admin | Pending Approvals, All Users, All Evidence (view-only), My Uploads (if admin also uploads) |
| Investigator | My Evidence, Upload Evidence |
| Custodian | My Evidence, Upload Evidence |
| Auditor | All Evidence (view-only), Custody Chain Viewer |

---

## 4. Admin-specific pages

### `/dashboard/pending-approvals`
- Calls `GET /auth/pending` — lists users with `is_active: false`
- Each row: email, created_at, and a form to approve: role dropdown (investigator/custodian/auditor/admin) + "Approve" button → `POST /auth/approve?target_email=...&role=...`
- Also a "Reject/Ignore" option is optional (backend has no reject endpoint currently — approve is the only state-changing action available; note this as a possible backend gap if you want a formal reject flow)
- After approving, remove that user from the pending list optimistically or refetch

### `/dashboard/users` (optional, if you want it)
- Would need a new backend endpoint (`GET /auth/users`, not built yet) to list ALL users, not just pending ones, with an option to call `POST /auth/revoke?target_email=...` to deactivate someone. Flag this as a backend addition if you want this page — currently only pending users are listable.

---

## 5. Evidence pages (investigator / custodian)

### `/dashboard/my-evidence`
- Needs a "list my evidence" endpoint, which **doesn't exist yet** in the backend — currently you can only fetch a single evidence's custody chain by ID, not list all evidence belonging to a user. Flag this as a backend addition: `GET /evidence/mine` returning all evidence rows where `uploaded_by == current_user.id`.
- Until that exists, a simpler MVP version: after each upload, keep the returned `evidence_id` in local state/a simple list so the user can see items they've uploaded *this session*. Persisting across sessions needs the backend addition above.

### `/dashboard/upload`
- File picker + Upload button
- On submit: `POST /evidence/upload` as `multipart/form-data` with the file, auth header attached
- On success: show `filename`, `sha256_hash`, and `evidence_id` clearly — this is the proof-of-hash moment, make it visually prominent (e.g., a card with a checkmark icon and the hash in a monospace font)
- Add the new evidence_id to the local "my evidence" list

### `/dashboard/evidence/[id]` (detail page, shared across roles)
- Calls `GET /evidence/{id}/custody-chain` — renders as a vertical timeline: each event shows action (upload/verify/verify_mismatch), actor, timestamp, and the hash link to the previous event (visually connect them, e.g. with a connecting line, to reinforce "this is a chain")
- A "Verify Now" button calling `POST /evidence/{id}/verify` — show result prominently: green badge "Integrity Intact" or red badge "MISMATCH DETECTED" with the two hashes shown side by side if they differ
- If the API returns 403 (wrong role/not the owner), show "You don't have access to this evidence" rather than a raw error

---

## 6. Auditor pages

### `/dashboard/all-evidence`
- Same backend gap as above — there's no "list all evidence" endpoint yet. For a real build, add `GET /evidence/all` (admin/auditor only) to the backend returning every evidence row. Until then, an auditor would need an evidence_id to look anything up, which isn't a great UX — recommend building this backend endpoint alongside the frontend work rather than skipping it.
- Once that endpoint exists: a table of all evidence — filename, uploader, upload date, last verification status — each row links to `/dashboard/evidence/[id]`

---

## 7. Shared components worth building once, reusing everywhere

- `<IntegrityBadge status="intact" | "mismatch" | "unverified" />` — colored badge component
- `<CustodyTimeline events={[...]} />` — the chain visualization
- `<RoleGuard allow={["admin","auditor"]}>...</RoleGuard>` — wrapper that hides/redirects if the logged-in user's role isn't in the allowed list, used to protect page content client-side (the real enforcement is still server-side, this is just UX)
- `<ProtectedRoute>` — wraps the whole `/dashboard` layout, redirects to `/login` if no valid token

---

## 8. Backend additions this frontend plan assumes (flag clearly, build these first or in parallel)

1. `GET /evidence/mine` — list evidence uploaded by the current user
2. `GET /evidence/all` — list all evidence (admin/auditor only)
3. (Optional) `GET /auth/users` — list every user, not just pending ones, for a full user-management admin page
4. (Optional) `POST /auth/reject` — explicitly reject/delete a pending signup rather than leaving it pending forever

---

## 9. Error/empty states to design for (often forgotten, worth doing properly for grading)

- Empty pending-approvals list ("No accounts waiting for approval")
- Empty my-evidence list ("You haven't uploaded any evidence yet — [Upload your first file]")
- Network/API unreachable (backend not running) — a friendly message, not a raw fetch error
- Token expired mid-session — redirect to login with "Your session expired, please log in again"
