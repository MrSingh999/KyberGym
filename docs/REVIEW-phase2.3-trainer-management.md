# Phase 2.3 — Trainer Management — Review Document

> Use this document for AI review and improvement analysis.

## Objective

Build a **Trainer Management System** that allows gym owners to create/manage trainers and assign members to them. Trainers get self-service access (dashboard, member list, profile view) while members remain manageable only by gym owners. Trainer profiles and trainer-member assignments are stored in dedicated collections — never embedded inside User or Member documents.

---

## What Changed

### Problem
The system had no trainer concept. Gym owners needed to manually manage workout instruction staff. There was no way to assign members to a specific trainer, no trainer-facing dashboard, and no audit trail for trainer-member relationships.

### Solution
Created dedicated `TrainerProfile` and `TrainerMemberAssignment` collections with full backend CRUD, member assignment lifecycle (assign/deactivate/activate/remove), owner-only management routes, trainer self-service routes, and a complete frontend management UI. The existing `ROLES.TRAINER` constant was leveraged — no separate auth system.

---

## Files Created

### Backend

| File | Purpose |
|---|---|
| `backend/src/modules/trainer/models/TrainerProfile.model.js` | Mongoose schema: `gymId`, `userId` (ref User, unique), `fullName`, `email` (unique within gym), `phone`, `specialization`, `status` (ACTIVE/INACTIVE), `joiningDate`, `createdBy`. Unique compound index on `(gymId, email)`. |
| `backend/src/modules/trainer/models/TrainerMemberAssignment.model.js` | Mongoose schema: `gymId`, `trainerId` (ref TrainerProfile), `memberId` (ref Member), `status` (ACTIVE/INACTIVE), `assignedBy` (ref User), `assignedAt`, `removedBy` (ref User), `removedAt`. Compound unique index on `(gymId, trainerId, memberId)` filtered on `status: ACTIVE`. |
| `backend/src/modules/trainer/trainer.repository.js` | `create`, `findAll` (with search, status filter, pagination, sort), `findById`, `findByUserId`, `findByEmail`, `updateById`, `updateByUserId`. Assignment: `assignMembers` (bulk with filter to skip duplicates), `findAssignmentsByTrainer` (with member population, pagination), `findActiveAssignment`, `removeAssignment` (soft delete). |
| `backend/src/modules/trainer/trainer.service.js` | `createTrainer` — creates User (role: trainer) + TrainerProfile in sequence with error cleanup. `getTrainers`, `getTrainerById`, `updateTrainer`, `deactivateTrainer` (deactivates profile + linked User), `activateTrainer`. `assignMembersToTrainer` — validates trainer is ACTIVE, validates all memberIds belong to gym, skips existing active assignments, returns `{ assigned, skipped, failed }`. `getTrainerMembers`, `removeMemberAssignment`. `getMyProfile`, `updateMyProfile`, `getMyMembers`. |
| `backend/src/modules/trainer/trainer.controller.js` | 13 handler methods: CRUD (owner), deactivate/activate (owner), assign/remove members (owner), me/profile (trainer self-service), me/members (trainer self-service). Uses `ApiSuccess.send`. |
| `backend/src/modules/trainer/trainer.validators.js` | Zod schemas: `createTrainerSchema` (fullName, email, password, phone, specialization), `updateTrainerSchema` (partial), `assignMembersSchema` (memberIds: non-empty array), `trainerQuerySchema` (search, status, page, limit, sort, order). |
| `backend/src/modules/trainer/trainer.routes.js` | Owner routes: POST `/`, GET `/`, GET `/:id`, PATCH `/:id`, POST `/:id/deactivate`, POST `/:id/activate`, POST `/:id/assign-members`, GET `/:id/members`, DELETE `/:id/members/:assignmentId`. Trainer routes: GET `/me/profile`, PATCH `/me/profile`, GET `/me/members`. |
| `backend/src/__tests__/trainer.test.js` | 16 tests covering create (success + duplicate email), list (basic + paginate), update, deactivate/activate, assign members (success + duplicate skip + inactive trainer rejection), list assigned members, remove assignment, cross-gym member rejection, role authorization (staff rejected), trainer self-service profile. |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/features/trainers/types/index.ts` | TypeScript interfaces: `TrainerProfile` (with populated user ref), `TrainerMemberAssignment`, `CreateTrainerData`, `UpdateTrainerData`, `AssignMembersData`, `TrainerListResponse`. Mirrors backend API shapes. |
| `frontend/src/features/trainers/hooks/useTrainers.ts` | TanStack Query hooks: `useTrainers` (owner list with search/pagination/filters), `useTrainer` (detail), `useCreateTrainer`, `useUpdateTrainer`, `useDeactivateTrainer`, `useActivateTrainer`, `useAssignMembers`, `useRemoveMemberAssignment`, `useMyProfile` (trainer self-service), `useMyMembers` (trainer self-service). |
| `frontend/src/features/trainers/layout/TrainerLayout.tsx` | Trainer sidebar layout with topbar (gym switcher, user menu), sidebar navigation (`TRAINER_NAVIGATION`), responsive (collapsible sidebar on mobile). Matches existing `AppLayout` pattern. |
| `frontend/src/features/trainers/pages/TrainerManagementPage.tsx` | Owner page: search input with status filter, paginated table (name, email, specialization, status badge, assigned members count, joined date), deactivate/activate inline buttons, Create Trainer button. |
| `frontend/src/features/trainers/pages/TrainerDashboardPage.tsx` | Trainer self-service: welcome message, stat cards (assigned members count, status badge, join date), specialization display. |
| `frontend/src/features/trainers/pages/TrainerMyMembersPage.tsx` | Trainer self-service: search-by-name input, paginated member grid (cards with name, email, status badge, member code, phone, assigned date), empty state, pagination controls. |
| `frontend/src/features/trainers/pages/TrainerProfilePage.tsx` | Trainer self-service: avatar area (Dumbbell icon), detail grid (email, phone, specialization, status, join date). |
| `frontend/src/features/trainers/components/CreateTrainerModal.tsx` | Form inside `ResponsiveModal`: fullName, email, password, phone, specialization inputs. Uses `react-hook-form` with `zodResolver`. Shows success/error toasts, closes on success, refetches list. |
| `frontend/src/features/trainers/components/AssignMembersModal.tsx` | Form inside `ResponsiveModal`: search + multi-select member list (fetched from `/members` API with pagination), checkbox selection. Displayed assigned/skipped counts on success. |

---

## Files Modified

### Backend

| File | Change |
|---|---|
| `backend/src/shared/idPrefixes.js` | Added `TRN: 'TRN'` prefix for TrainerProfile documents. |
| `backend/src/routes/index.js` | Added `trainerRoutes` import and mounted at `/trainers`. |

### Frontend

| File | Change |
|---|---|
| `frontend/src/lib/authStore.ts` | Added `'trainer'` to allowed roles. |
| `frontend/src/components/auth/RoleGuard.tsx` | Added `'trainer'` to role check logic. |
| `frontend/src/routes/index.tsx` | Added trainer layout + self-service routes (`/trainer/dashboard`, `/trainer/members`, `/trainer/profile`), admin route (`/admin/trainers`), root redirect (`/redirect` → `/admin/dashboard`) for non-trainer, `/trainer/dashboard` for trainer role. |
| `frontend/src/constants/navigation.ts` | Added `TRAINER_NAVIGATION` array, added "Trainers" nav item under "Gym Management" group. Role-gated sidebar renders different navigation based on user role. |

---

## Architectural Decisions

### 1. Dedicated Collections (Not Embedded)
Both `TrainerProfile` and `TrainerMemberAssignment` are separate collections — never embedded inside User or Member documents. Rationale: trainers are first-class entities with their own lifecycle; embedding would bloat the User document and make cross-trainer queries (e.g., "find all members assigned to trainer X") extremely inefficient.

### 2. User + Profile Dual Creation
Creating a trainer creates two documents: a `User` (with `role: 'trainer'`) and a `TrainerProfile`. If the profile creation fails, the User is cleaned up. This keeps the auth system generic (User model unchanged) while allowing trainer-specific fields (specialization, joining date) on the profile.

### 3. Deactivate Cascades to User
Deactivating a trainer sets `TrainerProfile.status = 'INACTIVE'` AND `User.status = 'inactive'`. This immediately prevents login. Reactivation reverses both. The linked User is found via `TrainerProfile.userId`.

### 4. Compound Unique Index on Assignments
The index `(gymId, trainerId, memberId)` with partial filter `{ status: 'ACTIVE' }` prevents duplicate active assignments while allowing re-assignment after removal. A member can be assigned to multiple trainers, but not the same trainer twice.

### 5. Soft Remove on Assignments
Removing a member assignment sets `status: 'INACTIVE'` and records `removedBy`/`removedAt`. Documents are never deleted — full audit trail preserved.

### 6. Cross-Gym Validation
All member operations validate that the member belongs to the requesting gym. Inactive trainers cannot receive new assignments. Cross-gym members are rejected with a 400.

### 7. Owner-Only Management, Trainer Self-Service
Only `GYM_ADMIN` can create/update/deactivate/activate trainers and assign/remove members. Trainers can only view their own profile and their assigned members — no CRUD.

### 8. Trainer Uses Existing Auth System
The existing `ROLES.TRAINER` constant is leveraged. The auth store and `RoleGuard` were updated to recognize `'trainer'` as a valid role. No separate auth service or token logic was introduced.

### 9. Frontend Role-Based Routing
The router checks the user's role at the root level. `GYM_ADMIN` and `STAFF` see the admin layout. `TRAINER` sees the trainer layout. The navigation component renders different links based on role.

### 10. Pagination on All List Endpoints
Both owner (`GET /trainers`) and trainer (`GET /trainers/me/members`) list endpoints support `?page=` and `?limit=` (default: page=1, limit=50, max: 200). Returns `{ data: [...], total, page, limit, totalPages }`.

---

## Recommendations for AI Review

### Architecture
- Creating a User + Profile in sequence is fragile — consider wrapping in a MongoDB transaction when the app adds replica-set support
- The `assignMembers` route accepts raw `memberIds` array — consider a size limit (e.g., max 100 per request) to prevent abuse
- No secondary index on `(gymId, memberId)` for reverse-lookup (which trainers are assigned to a given member) — currently not needed but worth noting
- The `TrainerMemberAssignment` model references `Member._id` directly — if the member is deleted (soft or hard), the assignment becomes orphaned

### Testing
- ✅ Create trainer (success + duplicate email): 2 tests
- ✅ List trainers (basic + paginate): 2 tests
- ✅ Update trainer: 1 test
- ✅ Deactivate/activate trainer: 2 tests
- ✅ Assign members (success + duplicate skip + inactive trainer rejection): 3 tests
- ✅ List assigned members: 1 test
- ✅ Remove assignment: 1 test
- ✅ Cross-gym member rejection: 1 test
- ✅ Role authorization (staff rejected): 1 test
- ✅ Trainer self-service profile: 1 test
- Consider adding a test for trainer self-service members endpoint
- Consider adding a test that verifies deactivated user cannot login (auth integration)

### Safety
- ✅ Cross-gym validation on member assignment
- ✅ Trainer must be ACTIVE to receive assignments
- ✅ Duplicate active assignments silently skipped (no error)
- ✅ Soft remove preserves data — no hard deletion
- ✅ Owner-only management (GYM_ADMIN gated)
- ✅ Password required at trainer creation
- ⚠️ No MongoDB transaction around user+profile dual creation — crash mid-flow could orphan a User
- ⚠️ No rate limiting on create/assign endpoints

### Frontend
- ✅ TypeScript compiles cleanly with zero errors
- ✅ Trainer layout matches existing AppLayout pattern
- ✅ Role-aware routing — trainers never see admin pages
- ✅ Assign modal fetches fresh member list on open
- ✅ Mobile-responsive: collapsible sidebar, card grid on members page
- ✅ Empty states for no assignments and no search results
- ✅ Create trainer form validates all required fields
- Consider adding a confirmation dialog before deactivating a trainer
- Consider showing a "Trainers" count badge on the admin nav item

### Future-Proofing
- When workout plans are trainer-assignable (Phase 3+), the `trainerId` on `TrainerMemberAssignment` can be used to scope workout plans
- When notifications are ready, trainer assignment/removal can trigger push notifications
- The `joiningDate` field enables tenure-based reporting
- The specialization field enables future "find trainer by specialty" functionality
- When the member portal is built, members could see "My Trainer" on their dashboard

---

## Production Readiness

| Criterion | Status |
|---|---|
| Trainers stored in dedicated collection | ✅ New `TrainerProfile` model |
| Trainer-member assignments in dedicated collection | ✅ New `TrainerMemberAssignment` model |
| Duplicate active assignments prevented | ✅ Compound unique index with partial filter |
| Cross-gym data isolation | ✅ Service-level validation + tenant middleware |
| Inactive trainers cannot receive assignments | ✅ Service validates `status === 'ACTIVE'` |
| Deactivate cascades to User login | ✅ Both profile + user status updated |
| Assignment response returns assigned/skipped/failed counts | ✅ Response shape: `{ assigned, skipped, failed }` |
| Soft remove preserves audit trail | ✅ `status: 'INACTIVE'` + `removedBy` + `removedAt` |
| Owner-only management routes | ✅ `requireRoles(GYM_ADMIN)` on all management routes |
| Trainer self-service routes | ✅ `/me/profile`, `/me/members` |
| List endpoints support pagination | ✅ Page/limit with total/totalPages meta |
| Frontend TypeScript compiles | ✅ `tsc --noEmit` passes |
| Frontend role-aware routing | ✅ Trainer sees trainer layout, admin sees admin layout |
| Frontend assign modal with member search | ✅ Search + pagination + checkbox multi-select |
| Mobile-responsive | ✅ Collapsible sidebar, card grid, modal drawers |
| Bulk assignment limit enforced | ✅ `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST = 100` |
| Trainer self-service profile restricted | ✅ Phone-only via `PATCH /me/profile` |
| Assigned member count efficient (no N+1) | ✅ Aggregation with `$lookup` |
| Member deletion policy documented | ✅ `docs/POLICY-member-deletion-trainer-assignments.md` |
| API documentation | ✅ `docs/API-trainer-management.md` |
| Business limits in config constants | ✅ `trainer.constants.js` |
| Deactivation confirmation (frontend) | ✅ AlertDialog with clear message |
| Backend test suite | ✅ 16 tests covering all endpoints and edge cases |

---

## Post-Review Improvements

The following refinements were applied after the initial implementation review:

### 1. Limit Bulk Member Assignments
Added `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST = 100` (configurable constant in `trainer.constants.js`). The `assignMembersSchema` validator now enforces `z.array(objectId).min(1).max(100)`, returning a 400 validation error if the limit is exceeded. No changes to the bulk assignment logic itself — only the guardrail was added.

### 2. Restrict Trainer Self-Service Profile Updates
Created a separate `updateMyProfileSchema` validator that only allows `phone` updates. Added `PATCH /me/profile` route (trainer-only), a `updateMyProfile` controller method, and a `updateMyProfile` service method. The service only writes `phone` to both `TrainerProfile` and the linked `User`. Full name, email, specialization, joining date, and status remain owner-controlled via `PATCH /:id`.

### 3. Return Assigned Member Count Efficiently
Replaced the N+1 query pattern in `findAllProfiles` with a MongoDB aggregation pipeline using `$lookup` to count active `TrainerMemberAssignment` documents per trainer in a single query. The same aggregation is applied to `findProfileById` and `findProfileByUserId`. The separate `countAssignments` repository method was removed. The `getTrainers` service method no longer loops through profiles with per-item count queries.

### 4. Member Deletion Policy
Created `docs/POLICY-member-deletion-trainer-assignments.md` documenting the current soft-delete behavior and the expected handling if hard deletion is introduced in the future. No code changes needed.

### 5. Trainer Search — Add Specialization
Extended the `$or` search filter in `findAllProfiles` to include `specialization` alongside existing `fullName`, `email`, and `phone`. Updated the frontend placeholder text to reflect the broader search scope.

### 6. Trainer Profile Summary
Updated `TrainerProfilePage` to display a row of stat cards above the detail section: **Active Members** (count), **Status** (ACTIVE/INACTIVE), and **Joined** (date). The `memberCount` is now included in the `getMyProfile` response via the aggregation pipeline. No new API calls — the data is already present in the profile response.

### 7. Deactivation Confirmation
Added an `AlertDialog` (confirmation dialog) to `TrainerManagementPage` triggered when the deactivate button is clicked. The dialog displays: *"This trainer will no longer be able to log in. Existing member assignments will remain unchanged."* Only proceeds to deactivate on explicit confirmation. Activation remains a single-click action (no confirmation needed).

### 8. Configuration Constants
Created `backend/src/modules/trainer/trainer.constants.js` with:
- `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST`: 100
- `DEFAULT_PAGE_SIZE`: 20
- `MAX_PAGE_SIZE`: 100

All hardcoded limits in validators, repository, and routes now reference these constants.

### 9. API Documentation
Created `docs/API-trainer-management.md` documenting all 12 endpoints across owner and trainer routes. Includes request/response shapes, validation rules, pagination parameters, search behavior, assignment response semantics, error reference, and constants table.

### 10. New or Modified Files Summary

| File | Change |
|---|---|
| `backend/src/modules/trainer/trainer.constants.js` | **NEW** — Configurable business limits |
| `backend/src/modules/trainer/trainer.validators.js` | Added `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST` to `assignMembersSchema`. Added `updateMyProfileSchema` (phone only). |
| `backend/src/modules/trainer/trainer.repository.js` | Replaced `findAllProfiles`, `findProfileById`, `findProfileByUserId` with aggregation (includes `memberCount` via `$lookup`). Added `specialization` to search `$or`. Removed `countAssignments`. |
| `backend/src/modules/trainer/trainer.service.js` | Removed N+1 loop in `getTrainers`. Removed separate `countAssignments` call from `getTrainerById`. Added `updateMyProfile`. |
| `backend/src/modules/trainer/trainer.controller.js` | Added `updateMyProfile` handler. |
| `backend/src/modules/trainer/trainer.routes.js` | Added `PATCH /me/profile` with `updateMyProfileSchema` validation. |
| `frontend/src/features/trainers/pages/TrainerManagementPage.tsx` | Added `AlertDialog` for deactivation confirmation. |
| `frontend/src/features/trainers/pages/TrainerProfilePage.tsx` | Added stat cards (member count, status, joining date) above profile details. |
| `docs/POLICY-member-deletion-trainer-assignments.md` | **NEW** — Member deletion policy documentation |
| `docs/API-trainer-management.md` | **NEW** — Full API reference documentation |
| `docs/REVIEW-phase2.3-trainer-management.md` | Updated with this post-review improvements section |
