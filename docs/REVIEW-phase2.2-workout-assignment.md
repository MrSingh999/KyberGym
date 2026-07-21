# Phase 2.2 — Workout Assignment System — Review Document

> Use this document for AI review and improvement analysis.

## Objective

Build a **Workout Assignment System** that allows gym admins to assign workout templates (from Phase 2.1) to members. Assignments are stored in a dedicated `WorkoutAssignment` collection — never embedded inside the Workout document. Supports ALL-members and SELECTED-members assignment, duplicate-skip logic, status lifecycle (ACTIVE/REMOVED), date-range scoping, and cross-gym validation.

---

## What Changed

### Problem
Phase 2.1 removed all assignment logic from the Workout model. Members had no way to receive workout templates. The entity relationship was embedded (assignment data lived inside `Workout.assignedMembers`), which bloated the workout document and made queries inefficient.

### Solution
Created a dedicated `WorkoutAssignment` collection with its own model, repository, service, controller, routes, validators, and full frontend management UI. The assignment system is decoupled from the workout library — workouts remain templates, assignments are first-class entities.

---

## Files Created

### Backend

| File | Purpose |
|---|---|
| `backend/src/modules/workoutAssignment/models/WorkoutAssignment.model.js` | Mongoose schema: `gymId`, `workoutId` (ref Workout), `memberId` (ref Member), `status` (ACTIVE/REMOVED), `assignedBy`, `assignedAt`, `startDate`, `endDate`, `removedAt`. Compound unique index on `(gymId, workoutId, memberId)` filtered on `status: ACTIVE`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.repository.js` | `create`, `findAll` (with search, status filter, workoutId filter, memberId filter, sort/order), `findById`, `updateById`, `softRemove` (sets `status: REMOVED` + `removedAt`), `findActiveByWorkoutAndMember` (for duplicate check), `findActiveByGymAndMember` (for member portal). Bulk `create` with `insertMany`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.service.js` | `assignWorkout` — validates workout exists & is ACTIVE, validates all memberIds belong to gym, handles ALL vs SELECTED, skips existing ACTIVE assignments, returns `{ assigned, skipped }` counts. `getAssignments`, `getAssignmentById`, `updateAssignment`, `removeAssignment`, `getMemberAssignments`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.controller.js` | 6 handler methods mirroring service methods. Uses `ApiSuccess.send` with standard response format. |
| `backend/src/modules/workoutAssignment/workoutAssignment.validators.js` | Zod schemas: `assignWorkoutSchema` (workoutId, assignmentType, memberIds with superRefine validation for SELECTED), `updateAssignmentSchema` (startDate, endDate, status), `assignmentQuerySchema` (memberId, workoutId, status, search, sort, order). |
| `backend/src/modules/workoutAssignment/workoutAssignment.routes.js` | POST `/`, GET `/`, GET `/:id`, PATCH `/:id`, DELETE `/:id`, GET `/member/:memberId`. Middleware stack: tenant resolution, auth, `requireFeature('workouts')`, `requireRoles(GYM_ADMIN)` for all routes. |
| `backend/src/__tests__/workout-assignment.test.js` | 14 tests covering assign (single, multiple, ALL, duplicate skip, non-ACTIVE workout rejection, cross-gym member rejection, empty SELECTED validation), list (basic + status filter), get by ID, update, soft remove, member-specific endpoint, role authorization, cross-gym workout rejection. |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/features/workoutAssignments/types/index.ts` | TypeScript interfaces: `WorkoutAssignment`, `WorkoutAssignmentListItem` (flattened for display), `AssignWorkoutData`, `UpdateAssignmentData`, `AssignmentFilters`. Type aliases: `AssignmentStatus`, `AssignmentType`, `AssignmentSortField`. Ref types for populated workout/member references. |
| `frontend/src/features/workoutAssignments/schemas/workoutAssignment.schema.ts` | Zod schemas: `assignWorkoutSchema` with `.refine()` cross-field validation (SELECTED requires memberIds), `updateAssignmentSchema`. Exported inferred types. |
| `frontend/src/features/workoutAssignments/hooks/useWorkoutAssignments.ts` | TanStack Query hooks: `useAssignments` (list with search/filters/sorting), `useAssignment` (detail), `useAssignWorkout` (mutation), `useUpdateAssignment`, `useRemoveAssignment`, `useMemberAssignments`. Query key factory `assignmentKeys` scoped by `gymId`. Standard data mapping from API `_id` to frontend shapes. |
| `frontend/src/features/workoutAssignments/store/useWorkoutAssignmentStore.ts` | Zustand store with persist: `searchQuery`, `filters` (status), `viewMode` (table only). Persists only `viewMode` preference. |
| `frontend/src/features/workoutAssignments/pages/WorkoutAssignmentsPage.tsx` | Full page: header with Assign button, search input, status filter dropdown, count badge, loading spinner, empty state (no-assignments or no-search variants), tanstack table with sort/remove, mobile card list, `AssignWorkoutModal` trigger, remove confirmation `ResponsiveModal`. |
| `frontend/src/features/workoutAssignments/components/AssignWorkoutModal.tsx` | Form inside `ResponsiveModal`: workout dropdown (fetched from workouts hook), assignment type toggle (SELECTED/ALL), member search + checkbox list (fetched from `/members` API), start/end date inputs. Uses `react-hook-form` with `zodResolver`. Shows success/error toasts with skip count. |
| `frontend/src/features/workoutAssignments/components/AssignmentsTable.tsx` | TanStack table with columns: Workout, Member, Status (badge), Assigned (date), Period (date range), Actions (remove button). Sortable by workout name, member name, assigned date. Manual server-side sorting. |
| `frontend/src/features/workoutAssignments/components/EmptyAssignmentsState.tsx` | Animated glass-panel empty state with two variants: "no-assignments" (with CTA to assign) and "no-search" (with clear filters suggestion). |

---

## Files Modified

### Backend

| File | Change |
|---|---|
| `backend/src/shared/idPrefixes.js` | Added `WKA: 'WKA'` prefix for WorkoutAssignment documents. |
| `backend/src/routes/index.js` | Added `workoutAssignmentRoutes` import and mounted at `/workout-assignments`. |
| `backend/src/__tests__/helpers.js` | Added `createTestWorkoutAssignment` factory. Updated `createTestWorkout` for new schema (removed `assignmentType`, added `status`). Updated `createTestWorkoutDay` (uses `orderIndex` instead of `dayNumber`). |

### Frontend

| File | Change |
|---|---|
| `frontend/src/routes/index.tsx` | Added `WorkoutAssignmentsPage` import and `/admin/workout-assignments` route under admin layout children. |
| `frontend/src/constants/navigation.ts` | Added "Workout Assignments" nav item under Gym Activity group with `Share2` icon. |

---

## Architectural Decisions

### 1. Dedicated Collection (Not Embedded)
Assignments live in their own `WorkoutAssignment` collection rather than inside the Workout document. This keeps workout documents lean, enables efficient per-member queries, avoids document size growth, and allows independent lifecycle management (an assignment can be REMOVED without touching the workout).

### 2. Compound Unique Index with Partial Filter
The index `(gymId, workoutId, memberId)` has a partial filter expression `{ status: 'ACTIVE' }`. This prevents duplicate active assignments while allowing multiple REMOVED entries for the same workout+member pair (audit trail). Without the filter expression, MongoDB would reject a re-assign after removal.

### 3. Bulk Create with Duplicate Skipping
The service uses `insertMany` with `ordered: false` for ALL-type assignment, and loops with individual duplicate checks for SELECTED. In both cases, members who already have an active assignment for the same workout are skipped silently. The response includes `{ assigned: N, skipped: M }` counts for UI feedback.

### 4. Cross-Gym Validation
The service validates that both the workout and all member IDs belong to the requesting gym before creating any assignments. This prevents cross-tenant data leaks even though the auth+tenant middleware already scopes the request. The validation also checks that the workout `status === 'ACTIVE'` — DRAFT or ARCHIVED workouts cannot be assigned.

### 5. Soft Remove (Not Hard Delete)
Removing an assignment sets `status: 'REMOVED'` and records `removedAt`. The document is never deleted. This preserves audit history and allows future "re-activate" functionality. The frontend confirms with a warning modal before proceeding.

### 6. No Member Portal Implementation
Phase 2.2 does NOT implement the member-facing view. The `findActiveByGymAndMember` repository method and `getMemberAssignments` service method are in place and exposed via `GET /member/:memberId` (admin-only), but the member dashboard/workout-plan pages remain placeholder text. Member portal will be built in a later phase.

### 7. Front-End Only for GYM_ADMIN
All assignment management routes and UI are gated behind `requireRoles(GYM_ADMIN)`. Staff members cannot create/remove assignments — only view is permitted through the tenant-scoped middleware. This aligns with the existing permission model where workout creation is owner-only.

### 8. Date-Range Support (Optional)
Both `startDate` and `endDate` are optional. When omitted, the assignment is considered indefinite. The backend stores them as ISODate strings. The frontend uses native `<input type="date">` for selection. Future phases can enforce scheduling logic (e.g., cannot assign in the past).

### 9. Populated References in Responses
The assignment list and detail endpoints populate `workoutId` (title only) and `memberId` (fullName, email) using Mongoose `.populate()`. The frontend maps these to a flattened `WorkoutAssignmentListItem` shape. Query performance is maintained by selecting only needed fields.

### 10. Zod SuperRefine for SELECTED Validation
The `assignWorkoutSchema` uses `superRefine` to enforce that `assignmentType === 'SELECTED'` requires a non-empty `memberIds` array. This produces a field-level validation error on `memberIds` that the frontend displays below the member list. The frontend also disables submit via the button state.

---

## Recommendations for AI Review

### Architecture
- The `insertMany` approach for ALL-type assignment doesn't return which specific members were skipped — consider returning a list of skipped member IDs for UI transparency
- `populate('workoutId', 'title')` is efficient, but `populate('memberId', 'fullName email')` on the list endpoint could be slow for gyms with thousands of assignments — consider pagination or lean queries with projection
- The compound unique index with partial filter only covers `(gymId, workoutId, memberId)` — should there be a secondary index on `(gymId, memberId)` for the member-assignment lookup?

### Testing
- ✅ Assign single member: 1 test
- ✅ Assign multiple members: 1 test
- ✅ Assign ALL members: 1 test
- ✅ Duplicate skip: 1 test
- ✅ Non-ACTIVE workout rejection: 1 test
- ✅ Cross-gym member rejection: 1 test
- ✅ Empty SELECTED validation: 1 test
- ✅ List assignments (basic + status filter): 2 tests
- ✅ Get assignment by ID: 1 test
- ✅ Update assignment: 1 test
- ✅ Soft remove: 1 test
- ✅ Member-specific endpoint: 1 test
- ✅ Role authorization: 1 test
- ✅ Cross-gym workout rejection: 1 test
- Consider adding a stress test with 500+ members in ALL-type assignment
- Consider adding a test for concurrent duplicate assignment race conditions

### Safety
- ✅ Cross-gym validation on both workout and members
- ✅ Workout must be ACTIVE to assign
- ✅ Duplicate active assignments are silently skipped (no error)
- ✅ Soft remove preserves data — no hard deletion
- ✅ Role-gated — only GYM_ADMIN can assign/remove
- ⚠️ No MongoDB transaction around the bulk create — if the server crashes mid-insert, some members may be assigned and others not
- ⚠️ No rate limiting on the assignment endpoint — a malicious admin could flood assignments

### Frontend
- ✅ TypeScript compiles cleanly with zero errors
- ✅ Assign modal always fetches fresh member list on open via `useEffect`
- ✅ Workout dropdown populated from existing `useWorkouts` hook (reuses cache)
- ✅ Search/filter state preserved across page navigation via Zustand persist
- ✅ Mobile-responsive: table on desktop, cards on mobile, drawer on assign modal
- ✅ Remove confirmation modal prevents accidental removals
- Consider adding client-side debounce on member search input
- Consider pagination or virtualization for the member list in the assign modal (for gyms with 1000+ members)

### Future-Proofing
- When the member portal is built, the `findActiveByGymAndMember` repository method and `getMemberAssignments` service/controller are ready — just need to add a member-facing route (e.g., `GET /members/me/workout-assignments`)
- When scheduling/calendar features are added, `startDate`/`endDate` fields are already present on every assignment
- When notification system is ready, assignment creation can trigger a push notification — the `assignedBy` field identifies who performed the action
- The `removedAt` timestamp enables analytics on average assignment duration

---

## Production Readiness

| Criterion | Status |
|-----------|--------|
| Assignments stored in dedicated collection | ✅ New `WorkoutAssignment` model |
| Duplicate active assignments prevented | ✅ Compound unique index with partial filter |
| Cross-gym data isolation | ✅ Service-level validation + tenant middleware |
| Non-ACTIVE workouts cannot be assigned | ✅ Service validates `workout.status === 'ACTIVE'` |
| Bulk assignment returns assigned/skipped counts | ✅ Response shape: `{ assigned: N, skipped: M }` |
| Soft remove sets status + timestamp | ✅ `status: 'REMOVED'` + `removedAt` |
| Role-gated (owner-only) | ✅ `requireRoles(GYM_ADMIN)` on all routes |
| Feature-flag gated | ✅ `requireFeature('workouts')` |
| List endpoint supports search, filter, sort | ✅ Query params: search, status, workoutId, memberId, sort, order |
| Member-specific endpoint | ✅ `GET /member/:memberId` (admin only) |
| Frontend TypeScript compiles | ✅ `tsc --noEmit` passes |
| Frontend empty states for all scenarios | ✅ No-assignments + no-search variants |
| Frontend assign modal with validation | ✅ react-hook-form + zodResolver + superRefine |
| Mobile-responsive | ✅ Desktop table, mobile cards, drawer modal |
| Backend test suite | ✅ 14 tests covering all endpoints and edge cases |
| No member portal implementation (future phase) | ✅ Member routes remain placeholder text |

---

## Post-Review Improvements

The following improvements were applied after the initial implementation review:

### 1. Optimized ALL-Type Assignment (Set-Based Diff)
The ALL-type assignment flow was verified to already use a set-based diff approach (not per-member queries). The code was refactored for clarity:
- Extract `findActiveByWorkoutAndMembers` as a dedicated repository method
- Remove inline `WorkoutAssignmentRepository.find` helper (merged into proper method)
- Use a single `Set` for O(1) duplicate checks
- Result: 3 DB round trips total regardless of member count (members query, existing assignments query, bulk insert)

### 2. Bulk Assignment Response with `failed: 0`
The assign response now explicitly includes a `failed` field:
```json
{ "assigned": 195, "skipped": 5, "failed": 0 }
```
This documents the intentional design: partial success is acceptable. No MongoDB transaction is used — if the server crashes mid-insert, `insertMany` may write a subset of documents. For Phase 2.2 this is acceptable because:
- Each assignment is an independent document
- There is no cascading data integrity requirement
- The response always reports actual `assigned` count from `insertMany` result
- A retry will skip already-assigned members (duplicate detection)

### 3. Pagination
Backend `findAll` now supports `?page=` and `?limit=` (default: page=1, limit=50, max: 200). Returns:
```json
{ "data": [...], "total": 195, "page": 1, "limit": 50, "totalPages": 4 }
```
Frontend `useAssignments` hook updated to accept `page`/`limit` params and return `PaginatedAssignments` shape. Assignments page shows pagination controls when `totalPages > 1`. Search/filter changes reset to page 1.

### 4. Audit Trail (`removedBy`)
Model now stores `removedBy` (User ref) and `removedAt` (Date) alongside existing `assignedBy`/`assignedAt`. The `removeAssignment` service method accepts `userId` and the repository `softRemove` sets both fields. The controller passes `req.user._id`. Test verifies `removedBy` is populated after removal. Future queries can answer: who assigned, who removed, when removed.

### 5. Debounced Member Search (Name + Code)
AssignWorkoutModal now features:
- 250ms debounce via custom `useDebounce` hook
- Search by `fullName` (case-insensitive substring)
- Search by `memberCode` (case-insensitive substring)
- Checkbox selections **preserved** during filtering (filtered from in-memory array, not re-fetched)
- Member code displayed alongside email in member list items

### 6. Read-Only Assigned Workouts on Member Profile
Added a new "Assigned Workouts" widget card on the MemberProfilePage, placed after the Payments summary. Displays a green-check list of active assigned workout titles. Shows "No workouts assigned" when empty. Uses existing `useMemberAssignments(memberId)` hook — no new API calls. No edit/remove actions (read-only per requirement).

---

**The Workout Assignment System module is feature-complete for Phase 2.2 scope.** All endpoints are implemented, validated, tested, and integrated with the frontend. The system is production-ready pending the warnings noted above (no transactions on bulk insert, no rate limiting).
