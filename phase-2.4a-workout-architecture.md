# Phase 2.4A — Workout Architecture Refactor

Refactor the workout module to support a **shared Workout Library** with strict role-based visibility and ownership authorization.

---

## Data Model

### `backend/src/modules/workouts/models/Workout.model.js`

**Add `visibility` (immutable after creation) and `isSystemWorkout`:**

```js
visibility: {
  type: String,
  enum: ['GYM', 'PRIVATE'],
  required: true,
  default: 'GYM',
  immutable: true, // cannot change after creation
},

isSystemWorkout: {
  type: Boolean,
  default: false,
},
```

**Add indices**:
```js
workoutSchema.index({ gymId: 1, createdBy: 1 });
workoutSchema.index({ gymId: 1, visibility: 1 });
```

**Visibility constants** (`backend/src/modules/workouts/workout.constants.js`):
```js
export const WORKOUT_VISIBILITY = {
  GYM: 'GYM',
  PRIVATE: 'PRIVATE',
};
```

**Default visibility logic** (set in service on create):
- `gym_admin`, `staff`, `super_admin` → `visibility = WORKOUT_VISIBILITY.GYM`
- `trainer` → `visibility = WORKOUT_VISIBILITY.PRIVATE`

---

## Repository Layer

**Repositories remain database-only.** No business-rule filtering.

### `backend/src/modules/workouts/workout.repository.js`

No changes to existing method signatures. Repositories accept only database-level params (IDs, filters, data). All visibility/role filtering moves to the service layer.

The service will:
- For **listing**: build the full Mongo filter (including `$or` for visibility) and pass it through a lightweight `findAllFiltered(filter, sortObj)` helper or a new `findByFilter(filter, sort)` method.
- For **single read**: call `findById(id, gymId)` then check visibility in the service (return null → 404).
- For **writes**: call `findById(id, gymId)` then `assertWorkoutOwnership` in the service.

---

## Authorization Utility

### New: `backend/src/modules/workouts/workout.auth.js`

Extract `assertWorkoutOwnership` into a standalone, imported utility:

```js
import createError from 'http-errors';

const ADMIN_ROLES = ['gym_admin', 'staff', 'super_admin'];

/**
 * Assert that the user is authorized to modify the given workout.
 * - Admin roles: full access.
 * - Trainer: only own workouts.
 * - Others: forbidden.
 */
export function assertWorkoutOwnership(workout, user) {
  if (ADMIN_ROLES.includes(user.role)) return;
  if (user.role === 'trainer') {
    if (!workout.createdBy.equals(user._id)) {
      throw createError.Forbidden('You can only modify your own workouts');
    }
    return;
  }
  throw createError.Forbidden('Insufficient permissions');
}
```

Both `workout.service.js` and `workoutDay.service.js` import and call this.

---

## Service Layer

### `backend/src/modules/workouts/workout.service.js`

Import `assertWorkoutOwnership` from `./workout.auth.js`.
Import `WORKOUT_VISIBILITY` from `./workout.constants.js`.

#### Updated methods

| Method | Signature change | Logic change |
|---|---|---|
| `createWorkout` | `(gymId, **user**, data)` | Set `visibility`: admin/staff→`WORKOUT_VISIBILITY.GYM`, trainer→`WORKOUT_VISIBILITY.PRIVATE` |
| `getWorkouts` | `(gymId, query, **user**)` | Build filter with visibility conditions; call `repo.findAll(gymId, mergedOptions)` |
| `getWorkoutById` | `(id, gymId, **user**)` | Fetch → if trainer, check visibility/ownership → 404 if not allowed |
| `updateWorkout` | `(id, gymId, data, **user**)` | Fetch → `assertWorkoutOwnership` → **strip `visibility` from data** (immutable) → repo.update |
| `deleteWorkout` | `(id, gymId, **user**)` | Fetch → `assertWorkoutOwnership` → repo.softDelete |
| `duplicateWorkout` | `(id, gymId, **userId, user**)` | Fetch original → `assertWorkoutOwnership` → clone (see spec below) |
| `archiveWorkout` | `(id, gymId, **user**)` | Fetch → `assertWorkoutOwnership` → repo.update status |
| `saveNested` | `(gymId, workoutId, data, **user**)` | Fetch → `assertWorkoutOwnership` → **strip `visibility` from data** → existing save logic |

**Duplicate copies all EXCEPT:**
| Field | Behavior |
|---|---|
| `_id`, `publicId` | Auto-generated (new document) |
| `createdBy` | **`userId`** (the authenticated user, NOT the original creator) |
| `visibility` | `user.role === 'trainer' ? 'PRIVATE' : 'GYM'` |
| `status` | Always `'DRAFT'` |
| `isDeleted` | Always `false` |
| `createdAt`, `updatedAt` | Auto-managed by Mongoose |
| `title`, `description`, `goal`, `estimatedDuration`, `category` | Copied as-is from original |
| `days` → `exercises` | Deep-cloned from original |

### `backend/src/modules/workoutDay/workoutDay.service.js`

Import `assertWorkoutOwnership` from `../workouts/workout.auth.js`.

Each method already fetches the parent workout via `WorkoutRepository.findById(workoutId, gymId)`. After that fetch, add `assertWorkoutOwnership(workout, user)`.

| Method | Signature change |
|---|---|
| `createDay` | `(gymId, workoutId, data, **user**)` |
| `updateDay` | `(id, workoutId, gymId, data, **user**)` |
| `deleteDay` | `(id, workoutId, gymId, **user**)` |
| `getDaysByWorkout` | `(workoutId, gymId, **user**)` |

Each: after `WorkoutRepository.findById` → `assertWorkoutOwnership(workout, user)`.

---

## Controller Layer

### `backend/src/modules/workouts/workout.controller.js`

Pass `req.user` to every service call:

| Endpoint | Before | After |
|---|---|---|
| `createWorkout` | `WorkoutService.createWorkout(gymId, userId, req.body)` | `WorkoutService.createWorkout(gymId, req.user, req.body)` |
| `getWorkouts` | `WorkoutService.getWorkouts(gymId, req.query)` | `WorkoutService.getWorkouts(gymId, req.query, req.user)` |
| `getWorkoutById` | `WorkoutService.getWorkoutById(req.params.id, gymId)` | `WorkoutService.getWorkoutById(req.params.id, gymId, req.user)` |
| `updateWorkout` | `WorkoutService.updateWorkout(req.params.id, gymId, req.body)` | `WorkoutService.updateWorkout(req.params.id, gymId, req.body, req.user)` |
| `deleteWorkout` | `WorkoutService.deleteWorkout(req.params.id, gymId)` | `WorkoutService.deleteWorkout(req.params.id, gymId, req.user)` |
| `duplicateWorkout` | `WorkoutService.duplicateWorkout(req.params.id, gymId)` | `WorkoutService.duplicateWorkout(req.params.id, gymId, req.user._id, req.user)` |
| `archiveWorkout` | `WorkoutService.archiveWorkout(req.params.id, gymId)` | `WorkoutService.archiveWorkout(req.params.id, gymId, req.user)` |
| `saveNested` | `WorkoutService.saveNested(gymId, req.params.id, req.body)` | `WorkoutService.saveNested(gymId, req.params.id, req.body, req.user)` |
| `createDay` | `WorkoutDayService.createDay(gymId, req.params.id, req.body)` | `WorkoutDayService.createDay(gymId, req.params.id, req.body, req.user)` |
| `updateDay` | `WorkoutDayService.updateDay(req.params.id, req.params.dayId, gymId, req.body)` | `WorkoutDayService.updateDay(req.params.id, req.params.dayId, gymId, req.body, req.user)` |
| `deleteDay` | `WorkoutDayService.deleteDay(req.params.id, req.params.dayId, gymId)` | `WorkoutDayService.deleteDay(req.params.id, req.params.dayId, gymId, req.user)` |

---

## Routes

### `backend/src/modules/workouts/workout.routes.js`

**Only one change**: Add `ROLES.TRAINER` to `DELETE /:id`:
```js
router.delete(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),  // was: only GYM_ADMIN
  asyncHandler(WorkoutController.deleteWorkout)
);
```
(Ownership is enforced in the service layer via `assertWorkoutOwnership`.)

---

## Test Suite

### `backend/src/__tests__/workout.test.js`

Add a `describe('Workout Authorization')` block with these test cases:

1. **Trainer creates workout → `visibility` is `'PRIVATE'`**
2. **Admin creates workout → `visibility` is `'GYM'`**
3. **Trainer lists workouts → sees GYM workouts + own PRIVATE workouts, NOT other trainer's PRIVATE workouts**
4. **Trainer tries to view another trainer's PRIVATE workout → 404**
5. **Trainer tries to edit another trainer's workout → 403**
6. **Trainer tries to delete another trainer's workout → 403**
7. **Trainer tries to duplicate another trainer's workout → 403**
8. **Trainer tries to archive another trainer's workout → 403**
9. **Trainer tries to saveNested on another trainer's workout → 403**
10. **Admin lists workouts → sees all workouts (GYM + all PRIVATE)**
11. **Admin edits trainer's PRIVATE workout → 200**
12. **Admin deletes trainer's PRIVATE workout → 200**
13. **Trainer can view another trainer's GYM workout (if visibility was overridden) → 200**

---

## Verification

1. `npm test -- workout.test.js` — all existing + 13 new tests pass
2. `npx eslint src/modules/workouts/ src/modules/workoutDay/` — zero lint errors
