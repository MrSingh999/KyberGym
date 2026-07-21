# Work Done — Phase 2.1 & 2.2

> Comprehensive summary of all implementation work across Workout Template Library (Phase 2.1) and Workout Assignment System (Phase 2.2).

---

## Phase 2.1 — Workout Template Library

### Objective
Refactor the existing workout module from a "workout program with member assignment" system to a **Workout Template Library** focused exclusively on template creation and management.

### Backend Changes

| File | What Changed |
|---|---|
| `backend/src/modules/workouts/models/Workout.model.js` | Added `goal` (free-text), `estimatedDuration` (optional), `category` (optional), `status` (DRAFT/ACTIVE/ARCHIVED, default ACTIVE), `isDeleted`. Removed `assignmentType`, `assignedMembers`, `isActive`. Indexed on `(gymId, isDeleted)` and `(gymId, status)`. |
| `backend/src/modules/workoutDay/models/WorkoutDay.model.js` | Renamed `dayNumber` → `orderIndex`. Exercise sub-schema: added `restTime`, `order`, `exerciseId` (nullable, future library prep). Unique index changed to `(workoutId, orderIndex)`. |
| `backend/src/modules/workouts/workout.validators.js` | Updated all Zod schemas. Removed `assignmentType`/`assignedMembers` validation. Added `nestedSaveSchema` for bulk save. |
| `backend/src/modules/workouts/workout.repository.js` | Added `search` (regex on title + goal), `status` filter, `sort`/`order` params. Added `findByOriginalName` for duplicate copy detection. Added `findByIdIncludingDeleted`. Changed `deactivate` → `softDelete`. |
| `backend/src/modules/workouts/workout.service.js` | Added `duplicateWorkout` (copies days + exercises, generates "Name (Copy/N)" naming), `archiveWorkout` (sets status=ARCHIVED), `saveNested` (smart diff: update existing, insert new, delete removed). |
| `backend/src/modules/workouts/workout.controller.js` | Added `duplicateWorkout`, `archiveWorkout`, `saveNested` handlers. |
| `backend/src/modules/workouts/workout.routes.js` | Added `POST /:id/duplicate`, `PATCH /:id/archive`, `PUT /:id/nested`. Member workout routes commented out with code preserved. |
| `backend/src/__tests__/workout.test.js` | Updated 8 existing tests. Added 18 new tests (duplicate, archive, soft delete, nested save, search, filter, sort, optional fields). **26 tests total.** |
| `backend/src/__tests__/helpers.js` | Updated `createTestWorkout`, `createTestWorkoutDay` for new schema. |

### Frontend Changes

| File | What Changed |
|---|---|
| `frontend/src/features/workouts/types/index.ts` | Added `WorkoutStatus` type. Updated all interfaces (goal, estimatedDuration, category, status, isDeleted, orderIndex, restTime, exerciseId). Removed assignment fields. |
| `frontend/src/features/workouts/schemas/workout.schema.ts` | Added goal, estimatedDuration, category, status, restTime, order, exerciseId. Removed assignmentType. Default status: ACTIVE. |
| `frontend/src/features/workouts/store/useWorkoutStore.ts` | Filters use `status` instead of `isActive`. |
| `frontend/src/features/workouts/hooks/useWorkouts.ts` | Added `useDuplicateWorkout`, `useArchiveWorkout`, `useSaveNestedWorkout`. Updated query params. Added `enabled` option. |
| **New** `frontend/src/features/workouts/pages/WorkoutEditorPage.tsx` | Unified create/edit single-page editor replacing separate Create/Edit pages. |
| **New** `frontend/src/features/workouts/components/WorkoutInfoSection.tsx` | Workout metadata form (title, description, goal, category, duration, status) with autocomplete datalists. |
| **New** `frontend/src/features/workouts/components/WorkoutDayEditor.tsx` | Day list with Up/Down reorder buttons and nested exercise forms. |
| **New** `frontend/src/features/workouts/components/ExerciseRow.tsx` | Compact inline exercise form row (name, sets, reps, rest, order, notes). |
| `frontend/src/features/workouts/pages/WorkoutsPage.tsx` | Search by name + goal, status filter, duplicate/archive actions, delete modal. |
| `frontend/src/features/workouts/pages/WorkoutDetailPage.tsx` | Removed member assignment section, added goal/category/duration stats, duplicate/archive buttons. |
| `frontend/src/features/workouts/components/WorkoutCard.tsx` | Displays new fields, duplicate/archive/delete handlers. |
| `frontend/src/features/workouts/components/WorkoutsTable.tsx` | New columns (goal, category, duration, status), actions dropdown. |
| `frontend/src/features/workouts/components/WorkoutToolbar.tsx` | Status filter dropdown. Search placeholder updated. |
| `frontend/src/features/workouts/components/WorkoutStatusBadge.tsx` | Accepts `status` instead of `isActive`. Semantic colors. |
| `frontend/src/features/workouts/components/WorkoutDayCard.tsx` | Uses `orderIndex + 1` for display, shows restTime. |
| `frontend/src/features/workouts/components/WorkoutDayForm.tsx` | Uses `orderIndex` instead of `dayNumber`. |
| `frontend/src/features/workouts/components/ExerciseForm.tsx` | Added restTime, order fields. |
| `frontend/src/features/workouts/components/WorkoutForm.tsx` | Updated for new schema. Removed assignment type. |
| `frontend/src/routes/index.tsx` | `/admin/workouts/new` and `/:id/edit` point to `WorkoutEditorPage`. |

### Key Decisions
- **Status lifecycle** (DRAFT/ACTIVE/ARCHIVED) replaces boolean `isActive`
- **Independent soft delete** (`isDeleted` separate from `status`)
- **Free-text goal** with autocomplete (not enum)
- **Nested save** with smart diff (no delete-and-recreate)
- **Duplicate naming** convention: "Name (Copy)", "Name (Copy 2)", etc.
- **Up/Down reordering** (no drag-and-drop library)
- **Single-page editor** (no wizard)
- **Member code preserved** — routes disabled, code kept for later phase

---

## Phase 2.2 — Workout Assignment System

### Objective
Build a dedicated Workout Assignment System allowing gym admins to assign workout templates (from Phase 2.1) to members. Assignments stored in a dedicated collection, not embedded.

### Backend — New Files

| File | Purpose |
|---|---|
| `backend/src/modules/workoutAssignment/models/WorkoutAssignment.model.js` | Mongoose schema with `gymId`, `workoutId`, `memberId`, `status` (ACTIVE/REMOVED), `assignedBy`, `assignedAt`, `removedBy`, `removedAt`, `startDate`, `endDate`. Compound unique partial index `(gymId, workoutId, memberId)` filtered on `status: ACTIVE`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.repository.js` | Full CRUD with `findAll` (search, status/memberId/workoutId filters, sort, **pagination**), `findById`, `updateById`, `softRemove` (sets status + removedBy + removedAt), `findActiveByWorkoutAndMembers` (bulk duplicate check), `findActiveByMember`, `bulkCreate`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.service.js` | `assignWorkout` — validates workout ACTIVE, validates all members belong to gym, set-based diff (3 round trips max), bulk insert, returns `{ assigned, skipped, failed }`. `getAssignments`, `getAssignmentById`, `updateAssignment`, `removeAssignment` (sets removedBy), `getMemberAssignments`. |
| `backend/src/modules/workoutAssignment/workoutAssignment.controller.js` | 6 handler methods. Standard `ApiSuccess.send` response format. |
| `backend/src/modules/workoutAssignment/workoutAssignment.validators.js` | Zod schemas with `superRefine` for SELECTED validation. Pagination params (page/limit, max 200). |
| `backend/src/modules/workoutAssignment/workoutAssignment.routes.js` | POST/GET `/workout-assignments`, GET/PATCH/DELETE `/:id`, GET `/member/:memberId`. Middleware: tenant → auth → `requireFeature('workouts')` → `requireRoles(GYM_ADMIN)`. |
| `backend/src/__tests__/workout-assignment.test.js` | 16 tests covering assign (single, multiple, ALL, duplicate skip, non-ACTIVE rejection, cross-gym rejection, empty SELECTED), list with pagination, filter by status, get by ID, update, soft remove with removedBy, member endpoint, role auth, cross-gym workout. |

### Backend — Modified Files

| File | Change |
|---|---|
| `backend/src/shared/idPrefixes.js` | Added `WKA: 'WKA'` prefix for WorkoutAssignment. |
| `backend/src/routes/index.js` | Mounted `/workout-assignments` routes. |
| `backend/src/__tests__/helpers.js` | Added `createTestWorkoutAssignment`. Updated existing factories. |

### Frontend — New Files

| File | Purpose |
|---|---|
| `frontend/src/features/workoutAssignments/types/index.ts` | Interfaces and types for assignment domain. |
| `frontend/src/features/workoutAssignments/schemas/workoutAssignment.schema.ts` | Zod schemas with `refine()` cross-field validation. |
| `frontend/src/features/workoutAssignments/hooks/useWorkoutAssignments.ts` | TanStack Query hooks: `useAssignments` (with pagination), `useAssignment`, `useAssignWorkout`, `useUpdateAssignment`, `useRemoveAssignment`, `useMemberAssignments`. |
| `frontend/src/features/workoutAssignments/store/useWorkoutAssignmentStore.ts` | Zustand store with persist (search, filters, viewMode). |
| `frontend/src/features/workoutAssignments/pages/WorkoutAssignmentsPage.tsx` | Full page: search, status filter, pagination controls, tanstack table, mobile cards, assign modal, remove confirmation. |
| `frontend/src/features/workoutAssignments/components/AssignWorkoutModal.tsx` | Form with workout dropdown, assignment type toggle (SELECTED/ALL), **debounced member search** (name + member code), checkbox list with preserved selections, date inputs. |
| `frontend/src/features/workoutAssignments/components/AssignmentsTable.tsx` | TanStack table with sortable columns, status badges, remove action. |
| `frontend/src/features/workoutAssignments/components/EmptyAssignmentsState.tsx` | Two variants: no-assignments (with CTA) and no-search. |

### Frontend — Modified Files

| File | Change |
|---|---|
| `frontend/src/routes/index.tsx` | Added `/admin/workout-assignments` route. |
| `frontend/src/constants/navigation.ts` | Added "Workout Assignments" nav item with `Share2` icon. |
| `frontend/src/features/members/pages/MemberProfilePage.tsx` | Added read-only "Assigned Workouts" widget displaying active assignments with checkmarks. |

### Key Decisions
- **Dedicated collection** — assignments never embedded in Workout documents
- **Compound unique partial index** — prevents duplicate ACTIVE assignments, allows multiple REMOVED entries
- **Bulk insert with duplicate skip** — `insertMany` + set-based diff; partial success is accepted
- **No MongoDB transactions** — each assignment is independent; response reports actual counts
- **Cross-gym validation** — workout and member IDs validated against requesting gym
- **Soft remove with audit** — `status: 'REMOVED'` + `removedBy` + `removedAt` preserved
- **Pagination** — backend returns `{ data, total, page, limit, totalPages }`; frontend shows page controls
- **Debounced member search** — 250ms debounce, search by name + member code, selections preserved while filtering
- **No member portal** — admin-only; member routes remain placeholder text
- **Role-gated** — GYM_ADMIN only for assign/remove

---

## Guardrails & Constraints
- No drag-and-drop library added (Up/Down buttons suffice)
- No separate `/restore` endpoint (restore via PATCH status)
- No trainer workflow
- No member portal implementation
- No workout tracking or analytics
- No notification triggers (future phase)
- All member workout code preserved but routes disabled
- TypeScript compiles cleanly (`tsc --noEmit` passes)
- Backend imports resolve correctly

---

## Tests Summary

| Suite | Tests | Status |
|---|---|---|
| Workout CRUD + business logic | 26 | ✅ Passing |
| Workout Assignment | 16 | ✅ Written (MongoMemoryServer pre-existing issue) |

Total: **42 tests** covering create, read, update, delete, duplicate, archive, nested save, search, filter, sort, pagination, authorization, cross-gym isolation, and soft delete behaviors.
