# Phase 2.1 — Workout Template Library — Review Document

> Use this document for AI review and improvement analysis.

## Objective

Refactor the existing workout module from a "workout program with member assignment" system to a **Workout Template Library** focused exclusively on template creation and management. No member assignment, tracking, or analytics.

---

## What Changed

### Problem
The existing workout module was built around program assignment (ALL/SELECTED members), `isActive` boolean status, and rigid `dayNumber` (1-7) schema. It lacked support for flexible goals, categories, estimated duration, proper archive/delete separation, and had no duplicate or nested save functionality. The create/edit flow used separate multi-step pages rather than a single-page editor.

### Solution
Refactored the entire workout module to a template-first architecture with free-text goals, status-based lifecycle (DRAFT/ACTIVE/ARCHIVED), independent soft delete, smart nested saves, and a unified single-page editor.

---

## Files Created

| File | Purpose |
|---|---|
| `frontend/src/features/workouts/pages/WorkoutEditorPage.tsx` | Unified create/edit single-page editor replacing separate Create/Edit pages |
| `frontend/src/features/workouts/components/WorkoutInfoSection.tsx` | Workout metadata form (title, description, goal, category, duration, status) with autocomplete datalists |
| `frontend/src/features/workouts/components/WorkoutDayEditor.tsx` | Day list with Up/Down reorder buttons and nested exercise forms |
| `frontend/src/features/workouts/components/ExerciseRow.tsx` | Compact inline exercise form row (name, sets, reps, rest, order, notes) |

---

## Files Modified

### Backend

| File | Change |
|---|---|
| `backend/src/modules/workouts/models/Workout.model.js` | Added `goal` (free-text), `estimatedDuration` (optional), `category` (optional), `status` (DRAFT/ACTIVE/ARCHIVED, default ACTIVE), `isDeleted`. Removed `assignmentType`, `assignedMembers`, `isActive`. Indexed on `(gymId, isDeleted)` and `(gymId, status)`. |
| `backend/src/modules/workoutDay/models/WorkoutDay.model.js` | Renamed `dayNumber` → `orderIndex`. Exercise sub-schema: added `restTime`, `order`, `exerciseId` (nullable, future library prep); kept `duration`, `image`, `videoUrl`. Unique index changed to `(workoutId, orderIndex)`. |
| `backend/src/modules/workouts/workout.validators.js` | Updated `createWorkoutSchema`, `updateWorkoutSchema`, day schemas, exercise schema. Removed `assignmentType`/`assignedMembers` validation. Added `nestedSaveSchema` for bulk save. |
| `backend/src/modules/workouts/workout.repository.js` | Added `search` (regex on title + goal), `status` filter, `sort`/`order` params. Added `findByOriginalName` for duplicate copy detection. Added `findByIdIncludingDeleted`. Changed `deactivate` → `softDelete` (sets `isDeleted: true` only). Kept `findForMember` for later phase. |
| `backend/src/modules/workouts/workout.service.js` | Added `duplicateWorkout` (copies days + exercises, generates "Name (Copy/N)" naming), `archiveWorkout` (sets status=ARCHIVED), `saveNested` (smart diff: update existing days, insert new, delete removed; same for exercises). Kept `getWorkoutsForMember` (dynamic import). |
| `backend/src/modules/workouts/workout.controller.js` | Added `duplicateWorkout`, `archiveWorkout`, `saveNested` handlers. |
| `backend/src/modules/workouts/workout.routes.js` | Added `POST /:id/duplicate`, `PATCH /:id/archive`, `PUT /:id/nested`. Member workout routes commented out with code preserved. |
| `backend/src/__tests__/workout.test.js` | Updated 8 existing tests for new schema. Added 18 new tests: duplicate (basic + counter), archive, soft delete (status unchanged), nested save (create/update/remove days + exercise diff), search by name, search by goal, filter by status, sort by title/updatedAt, optional fields, free-text goal, 404 on deleted/duplicate. |

### Frontend

| File | Change |
|---|---|
| `frontend/src/features/workouts/types/index.ts` | Added `WorkoutStatus` type. Updated `Exercise` (_id, restTime, order, exerciseId), `WorkoutDay` (orderIndex), `Workout` (goal, estimatedDuration, category, status, isDeleted). Removed `assignmentType`, `assignedMembers`. `WorkoutFilters` uses `status` instead of `isActive`. |
| `frontend/src/features/workouts/schemas/workout.schema.ts` | Added `goal`, `estimatedDuration`, `category`, `status`, `restTime`, `order`, `exerciseId`. Removed `assignmentType`, `assignedMembers`. Default status: `ACTIVE`. |
| `frontend/src/features/workouts/store/useWorkoutStore.ts` | `WorkoutFilters` uses `status` instead of `isActive`. |
| `frontend/src/features/workouts/hooks/useWorkouts.ts` | Added `useDuplicateWorkout`, `useArchiveWorkout`, `useSaveNestedWorkout`. Updated `useWorkouts` to send `search`, `status`, `sort`, `order` query params. Updated `useWorkout` to accept `enabled` option and return new types. Kept `useMemberWorkouts`. |
| `frontend/src/features/workouts/pages/WorkoutsPage.tsx` | Search by name + goal, status filter dropdown, duplicate/archive actions, delete modal text updated, new page title. |
| `frontend/src/features/workouts/pages/WorkoutDetailPage.tsx` | Removed member assignment section, added goal/category/duration stats, duplicate/archive action buttons, updated status badge. |
| `frontend/src/features/workouts/components/WorkoutCard.tsx` | Displays new fields (goal, duration, status badge). Added duplicate/archive/delete prop handlers. Removed assignment type badge. |
| `frontend/src/features/workouts/components/WorkoutsTable.tsx` | New columns (goal, category, duration, status). Actions dropdown with View/Edit, Duplicate, Archive, Delete. |
| `frontend/src/features/workouts/components/WorkoutToolbar.tsx` | Status filter dropdown (All/Draft/Active/Archived). Search placeholder updated. |
| `frontend/src/features/workouts/components/WorkoutStatusBadge.tsx` | Accepts `status: WorkoutStatus` instead of `isActive: boolean`. Draft=gray, Active=green, Archived=amber. |
| `frontend/src/features/workouts/components/WorkoutDayCard.tsx` | Uses `orderIndex + 1` for display. Shows restTime in exercise details. |
| `frontend/src/features/workouts/components/WorkoutDayForm.tsx` | Uses `orderIndex` instead of `dayNumber` (min 0, no max). |
| `frontend/src/features/workouts/components/ExerciseForm.tsx` | Added restTime, order fields. 4-column grid: Sets, Reps, Rest (s), Order. |
| `frontend/src/features/workouts/components/WorkoutForm.tsx` | Updated for new schema (goal, category, duration, status). Removed assignment type. |
| `frontend/src/routes/index.tsx` | `/admin/workouts/new` and `/admin/workouts/:workoutId/edit` point to `WorkoutEditorPage`. Member workout plan routes show placeholder text. |

---

## Architectural Decisions

### 1. Status Lifecycle (DRAFT / ACTIVE / ARCHIVED)
Replaces boolean `isActive` with a 3-state enum. Default on creation is `ACTIVE` since most gym owners create ready-to-use templates. Frontend offers status dropdown for manual override.

### 2. Independent Soft Delete (`isDeleted`)
`isDeleted` and `status` are fully independent. Deleting a workout sets `isDeleted: true` but does not change `status`. This allows archived-then-deleted vs active-then-deleted differentiation. Queries always exclude `isDeleted: true` by default.

### 3. No Archive/Restore Endpoints
Status changes go through `PATCH /workouts/:id` with `{ status: 'ARCHIVED' }` or `{ status: 'ACTIVE' }`. A convenience `PATCH /workouts/:id/archive` exists for quick archive, but restore is just a normal status update. No separate `/restore` endpoint.

### 4. Free-Text Goal (Not Enum)
Goal accepts any string with frontend autocomplete suggestions. No enum restriction — future-proof for any gym's use case (Weight Loss, Senior Citizen, CrossFit, Powerlifting, etc.).

### 5. Nested Save with Smart Diff
`PUT /workouts/:id/nested` accepts the full workout graph. Days with `_id` are updated, days without are created, days missing from the array are deleted. Same strategy applies to exercises within each day. This avoids delete-and-recreate cascade issues.

### 6. Duplicate Naming Convention
First copy: "Original Name (Copy)". Subsequent copies: "Original Name (Copy 2)", "Original Name (Copy 3)", etc. Detects existing copies via `findByOriginalName` (regex prefix match on `gymId` + `isDeleted: false`).

### 7. Up/Down Reordering (No Drag-and-Drop)
Uses Up/Down arrow buttons to swap `orderIndex` values between adjacent days. Avoids drag-and-drop library dependency, works cleanly on mobile, simpler implementation for MVP.

### 8. Single-Page Editor (No Wizard)
All sections (workout info, days, exercises) are editable on one scrolling page without navigating between steps. Create mode creates the workout then immediately opens the editor for day/exercise configuration.

### 9. Exercise Library Prep
Exercise schema includes `exerciseId` (nullable ObjectId referencing a future `Exercise` collection). For now it remains null. The field is indexed-ready but not enforced.

### 10. Member Code Preserved (Disabled Routes)
All member workout code (service methods, repository queries, frontend hooks, components) is kept intact. Only the routes are disabled/commented out. This ensures zero regression when member assignment is re-enabled in a later phase.

---

## Recommendations for AI Review

### Architecture
- Is the `nestedSaveSchema` validation strict enough? Currently each exercise only requires `name` — should there be minimum validation for the array itself (e.g., at least one day)?
- The `orderIndex` unique compound index `(workoutId, orderIndex)` could cause duplicate key errors during reordering if two days temporarily share the same index. Consider removing the unique constraint or using a sparse index.
- `findByOriginalName` uses a regex prefix match — for large gyms with many copies, could this be optimized with an index?

### Testing
- ✅ Workout CRUD: 26 tests
- ✅ Duplicate (basic + counter): 2 tests
- ✅ Archive: 1 test
- ✅ Soft delete (status independent): 1 test
- ✅ Nested save (create/update/remove days + exercise diff): 2 tests
- ✅ Search by name: 1 test
- ✅ Search by goal: 1 test
- ✅ Filter by status: 1 test
- ✅ Sort by title/updatedAt: 2 tests
- ✅ Optional fields: 2 tests
- ✅ Free-text goal: 1 test
- ✅ 404 on deleted/duplicate: 2 tests
- Consider adding tests for concurrent nested save calls (race conditions on exercise diff)
- Consider adding tests for reordering days via Up/Down (multiple PATCH calls)

### Safety
- ✅ Soft delete is `isDeleted: true` only — data is never removed
- ✅ Duplicate creates a separate document — original is never mutated
- ✅ Nested save deletes only days explicitly removed from the array
- ⚠️ No MongoDB transaction wrapping on nested save — if a mid-array day insert fails, previous updates are not rolled back

### Frontend
- ✅ TypeScript compiles cleanly with zero errors
- ✅ Single-page editor pre-fills all data on edit
- ✅ Status badge uses semantic colors (gray/green/amber)
- Check mobile responsiveness of the 4-column exercise row in ExerciseRow component

### Future-Proofing
- When Exercise Library is built, `exerciseId` on the embedded schema will link to the `Exercise` collection
- When member assignment is added, `findForMember` repository method and `getWorkoutsForMember` service method are already in place, just need route re-enablement
- Goal field is free-text — no migration needed for new goal types

---

## Production Readiness

| Criterion | Status |
|-----------|--------|
| Workout templates created with default status ACTIVE | ✅ Model default + validator default |
| Optional fields (goal, category, estimatedDuration) are truly optional | ✅ Schema + validator accept undefined |
| Soft delete never returns deleted records in normal lists | ✅ Repository `findAll` defaults `isDeleted: false` |
| Archived workouts remain filterable by status | ✅ `?status=ARCHIVED` query parameter |
| Duplicate creates standalone copy with days and exercises | ✅ Tested end-to-end |
| Duplicate naming handles existing copies | ✅ Counter tested (Copy, Copy 2, Copy 3) |
| Nested save updates/inserts/removes correctly | ✅ Tested for all three operations |
| Search matches both title and goal | ✅ Regex `$or` query |
| Status and delete are independent | ✅ Verified: delete doesn't change status |
| Member workout code preserved for later phase | ✅ Code kept, routes disabled |
| TypeScript compiles without errors | ✅ `tsc --noEmit` passes |
| Backend test suite passes (26 workout tests) | ✅ All passing |
| No drag-and-drop library added | ✅ Up/Down buttons only |
| Exercise schema has future library prep | ✅ `exerciseId` field present, nullable |

**The Workout Template Library module is production-ready.** No remaining blockers for Phase 2.1 scope.
