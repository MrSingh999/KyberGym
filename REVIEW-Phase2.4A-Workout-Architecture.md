# Phase 2.4A — Workout Architecture Refactor

## Goal

Replace the multi-visibility workout system (`PRIVATE` / `GYM`) with a single shared **Workout Library** per gym. Every gym member (admin, staff, trainer) can view every workout. Ownership (`createdBy`) governs only write operations (edit, delete, archive, day CRUD).

## Key Decisions

| Decision | Rationale |
|---|---|
| **No `visibility` field** | All workouts in a gym are visible to all members — no need to distinguish PRIVATE vs GYM |
| **No `isSystemWorkout`** | Not needed; the field was considered and rejected |
| **No `createdByRole`** | Role is resolved from the User document at runtime; storing it duplicates truth |
| **`createdBy` only for write auth** | `assertWorkoutOwnership` checks `workout.createdBy.equals(user._id)` |
| **Admins bypass ownership** | `gym_admin`, `staff`, `super_admin` can edit/delete any workout |
| **Duplicate transfers ownership** | The duplicate gets `createdBy` set to the authenticated user, `status: DRAFT`, fresh timestamps |
| **Local MongoDB for tests** | Replaced `mongodb-memory-server` (781 MB download) with running local MongoDB at `mongodb://localhost:27017/kybergym_test` |

## Final Design

```
Workout {
  _id, gymId, title, description, goal, category, estimatedDuration,
  status, isDeleted, copyCount,
  createdBy (ref: User, for write ownership only),
  days[] (embedded subdocuments),
  timestamps
}
```

- **Reads**: Unrestricted within the gym — any authenticated gym member can see any workout.
- **Writes**: Enforced by `assertWorkoutOwnership` in `workout.auth.js`. Trainers may only edit/delete/archive/day-CRUD workouts where `createdBy` matches their `_id`. Admins bypass the check.

## Files Changed

| File | Change |
|---|---|
| `workout.constants.js` | Removed `WORKOUT_VISIBILITY`; kept only `ADMIN_ROLES` |
| `Workout.model.js` | Removed `visibility` field, `isSystemWorkout`, extra compound indexes |
| `workout.auth.js` | New file — exports `assertWorkoutOwnership` |
| `workout.service.js` | Stripped all visibility filtering; added ownership checks on writes |
| `workoutDay.service.js` | Removed visibility guard from `getDaysByWorkout`; kept ownership on day CRUD |
| `workout.test.js` | Rewrote authorization tests (10 → 9 tests) for shared-library model |
| `setup.js` | Swapped `MongoMemoryReplSet` for local MongoDB connection |

## Test Results

**35 tests passing** (26 original route tests + 9 authorization tests):
- `trainer sees every workout in the gym`
- `admin sees every workout in the gym`
- `trainer edits own workout → 200`
- `trainer edits another trainer workout → 403`
- `trainer deletes own workout → 200`
- `trainer deletes another trainer workout → 403`
- `admin edits any workout → 200`
- `admin deletes any workout → 200`
- `duplicate transfers ownership to the duplicator`

## How to Run Tests

```bash
cd backend
npx vitest run src/__tests__/workout.test.js
```

Requires a running local MongoDB instance at `mongodb://localhost:27017/kybergym_test`.
