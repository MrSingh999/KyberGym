# Phase 2.4B — Shared Workout Library

## Goal

Implement the Shared Workout Library as specified — no visibility/PRIVATE/GYM concepts, only `createdBy` for write authorization, every authorized gym member can read every workout, duplicate preserves original status.

## Changes from Phase 2.4A

| Change | Before (2.4A) | After (2.4B) | Spec Reference |
|---|---|---|---|
| Duplicate status | Forced `DRAFT` | Preserves `workout.status` | "Do NOT automatically change it to DRAFT" |
| Repository dead code | `findByFilter` present | Removed — unused | "Only database queries. No business logic." |
| Tests | 35 tests | 37 tests | +2: status preservation + nested data verification |

## Architecture Compliance

| Requirement | Status | Implementation |
|---|---|---|
| No `visibility`, `PRIVATE`, `GYM` | ✅ | `Workout.model.js` — no such fields |
| No `createdByRole`, `isSystemWorkout` | ✅ | Not stored anywhere |
| `assertWorkoutOwnership` centralized | ✅ | `workout.auth.js` — reused in service + day service |
| `gym_admin`/`super_admin` bypass ownership | ✅ | `ADMIN_ROLES.includes(user.role)` → return |
| `trainer` can only write own workouts | ✅ | `workout.createdBy.equals(user._id)` → 403 |
| Read access via existing auth middleware | ✅ | `requireRoles(GYM_ADMIN, STAFF, TRAINER)` on GET routes |
| Duplicate preserves status | ✅ | `status: workout.status` (not hardcoded `DRAFT`) |
| Duplicate copies all nested data | ✅ | Exercises, sets, reps, restTime, notes, order, etc. |
| Duplicate transfers `createdBy` | ✅ | `createdBy: userId` |
| Repository: DB queries only | ✅ | `findByFilter` removed |
| No Member Workout Plans | ✅ | Not implemented — belongs to next phase |

## Files Modified

| File | Change |
|---|---|
| `workout.service.js:92` | `status: 'DRAFT'` → `status: workout.status` |
| `workout.repository.js` | Removed dead `findByFilter` method |
| `workout.test.js` | Fixed duplicate status assertion; added 2 new tests |

## Test Results

**37 tests passing** (26 original route tests + 11 authorization/behavior tests):

```
✓ trainer sees every workout in the gym
✓ admin sees every workout in the gym
✓ trainer edits own workout → 200
✓ trainer edits another trainer workout → 403
✓ trainer deletes own workout → 200
✓ trainer deletes another trainer workout → 403
✓ admin edits any workout → 200
✓ admin deletes any workout → 200
✓ duplicate transfers ownership to the duplicator
✓ duplicate preserves workout status
✓ duplicate copies nested workout data correctly
```

## How to Run Tests

```bash
cd backend
npx vitest run src/__tests__/workout.test.js
```

Requires a running local MongoDB instance at `mongodb://localhost:27017/kybergym_test`.
