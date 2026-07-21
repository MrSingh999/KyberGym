# Phase 2.4 — Trainer Workout Management — Review Document

> Use this document for AI review and improvement analysis.

---

## Objective

Implement the Trainer Workout Management module enabling trainers to create personalized workout plans for their assigned members, while preserving the owner's reusable Workout Template Library as immutable.

---

## Architecture

```
Workout Template (owner-created, immutable)
       │
       ▼  Clone (deep copy)
Member Workout Plan (trainer-owned, per-member)
       │
       ▼  Customize
Member Workout Plan with personalized days/exercises
```

The original template is never modified. The clone is a fully independent document.

---

## Files Created

### Backend

| File | Purpose |
|---|---|
| `backend/src/modules/memberWorkoutPlan/models/MemberWorkoutPlan.model.js` | Mongoose schema: `gymId`, `memberId`, `trainerId`, `sourceWorkoutId` (nullable), `title`, `description`, `goal`, `estimatedDuration`, `category`, `status` (ACTIVE/ARCHIVED), `createdBy`, `updatedBy`, `archivedBy`, `archivedAt`. Indexed on `(gymId, memberId)`, `(gymId, trainerId)`, `(gymId, status)`. |
| `backend/src/modules/memberWorkoutPlan/models/MemberWorkoutPlanDay.model.js` | Same exercise subdocument structure as WorkoutDay (name, sets, reps, duration, restTime, notes, order, exerciseId, image, videoUrl). Referenced by `planId`. Compound unique index on `(planId, orderIndex)`. |
| `backend/src/modules/memberWorkoutPlan/memberWorkoutPlan.repository.js` | `create`, `findAll` (with aggregation for member/trainer names, search, status filter, sort, pagination), `findById`, `findByTrainer`, `findByMember`, `update`, `archive`. |
| `backend/src/modules/memberWorkoutPlan/memberWorkoutPlan.service.js` | `createPlan` — handles both scratch and template clone flows. Validates trainer-member assignment. Deep-clones all days+exercises from source template. `getPlans`, `getPlanById` (with days joined), `updatePlan`, `archivePlan`, `saveNested` (same reconciliation pattern as Workout's saveNested). |
| `backend/src/modules/memberWorkoutPlan/memberWorkoutPlan.controller.js` | 8 handler methods: create, list, get by trainer, get my plans, get by member, get by ID, update, archive, save nested. |
| `backend/src/modules/memberWorkoutPlan/memberWorkoutPlan.validators.js` | Zod schemas: `createPlanSchema` (memberId, trainerId, sourceWorkoutId optional, title optional), `updatePlanSchema`, `planQuerySchema` (search, trainerId, memberId, status, sort, order, page, limit), `nestedSaveSchema` (same structure as workout nested save). |
| `backend/src/modules/memberWorkoutPlan/memberWorkoutPlan.routes.js` | GET `/` (admin+trainer), GET `/my` (trainer), GET `/trainer/:trainerId` (admin), GET `/member/:memberId` (admin+trainer), POST `/` (trainer+admin), GET `/:id`, PATCH `/:id`, PUT `/:id/nested`, POST `/:id/archive`. All require ROLES.GYM_ADMIN or ROLES.TRAINER with tenant+auth middleware. |
| `backend/src/__tests__/member-workout-plan.test.js` | 8 tests: create from scratch, reject unassigned trainer, create from template, list plans, nested save, archive, reject cross-gym member, pagination. |

### Frontend

| File | Purpose |
|---|---|
| `frontend/src/features/memberWorkoutPlans/types/index.ts` | TypeScript interfaces: `PlanExercise`, `PlanDay`, `MemberWorkoutPlan`, `MemberWorkoutPlanWithDays`, `PlanListItem`, `CreatePlanData`, `UpdatePlanData`, `NestedSaveData`, `PlanQueryParams`. Mirrors backend API shapes. |
| `frontend/src/features/memberWorkoutPlans/hooks/useMemberWorkoutPlans.ts` | TanStack Query hooks: `useMemberWorkoutPlans`, `useMyPlans`, `useMemberPlans`, `useMemberWorkoutPlan`, `useCreateMemberWorkoutPlan`, `useSaveNestedPlan`, `useArchivePlan`, `useUpdatePlan`. |
| `frontend/src/features/memberWorkoutPlans/pages/TrainerWorkoutPlansPage.tsx` | Trainer list page: search/filter, card grid with edit/archive actions, create modal (select member + template-or-scratch toggle + template picker), pagination. |
| `frontend/src/features/memberWorkoutPlans/pages/MemberWorkoutPlanEditorPage.tsx` | Editor page **reusing** `WorkoutInfoSection`, `WorkoutDayEditor`, `ExerciseRow` from Phase 2.1. Uses same form schema. Calls `/member-workout-plans/:id/nested` instead of `/workouts/:id/nested`. |

### Files Modified

| File | Change |
|---|---|
| `backend/src/shared/idPrefixes.js` | Added `MWP: 'MWP'` (MemberWorkoutPlan) and `MWD: 'MWD'` (MemberWorkoutPlanDay). |
| `backend/src/routes/index.js` | Added `memberWorkoutPlanRoutes` import and mounted at `/member-workout-plans`. |
| `frontend/src/routes/index.tsx` | Added trainer routes: `/trainer/workout-plans` (list) and `/trainer/workout-plans/:planId/edit` (editor). |
| `frontend/src/constants/navigation.ts` | Added "Training" group with "My Workout Plans" item to `TRAINER_NAVIGATION`. |

---

## Key Design Decisions

### 1. Reused Workout Editor UI
The editor page (`MemberWorkoutPlanEditorPage`) imports `WorkoutInfoSection`, `WorkoutDayEditor`, and `ExerciseRow` directly from Phase 2.1's workout feature. These components accept `UseFormReturn<any>` and work with any form shape that includes `title`, `description`, `goal`, `estimatedDuration`, `category`, `status`, and `days[].exercises[]`. Only the API endpoint and navigation differ.

### 2. Deep Clone (Not Reference)
When cloning from a template, all days and exercises are copied by value into new `MemberWorkoutPlanDay` documents with a new `planId`. No references to the original `WorkoutDay._id` are retained. The `sourceWorkoutId` is stored for audit purposes only.

### 3. Two Creation Flows
- **From Scratch**: Creates an empty plan (no days) with `status: 'ACTIVE'`. Trainer then opens the editor to add days/exercises.
- **From Template**: Deep-clones all days and exercises from the source Workout. Auto-generates title as `"{Original Title} (Personalized)"`. Opens the editor for further customization.

### 4. Trainer-Member Assignment Validation
`createPlan` validates that the trainer is assigned to the member via `TrainerRepository.findActiveAssignments`. Unassigned trainers receive a 403 Forbidden. This prevents trainers from creating plans for members they don't manage.

### 5. Owner + Trainer Authorization
- Trainers can create, edit, and archive their own plans.
- Owners can view, edit, and archive any plan.
- Both roles use the same routes — authorization is enforced by the route definition (both roles listed in `requireRoles`).

### 6. No Hard Delete
Plans are soft-archived (status set to `ARCHIVED`, `archivedBy` and `archivedAt` recorded). No hard deletion is implemented.

---

## Production Readiness

| Criterion | Status |
|---|---|
| Clone from template preserves original | ✅ Deep copy, independent documents |
| Create from scratch | ✅ Empty plan created, editor opens |
| Nested save (bulk update) | ✅ Same pattern as Workout's saveNested |
| Trainer validates assignment | ✅ Rejects unassigned trainers |
| Cross-gym validation | ✅ Tenant middleware + service check |
| Soft archive (no hard delete) | ✅ `status: 'ARCHIVED'` + audit fields |
| Reused editor UI | ✅ WorkoutInfoSection, WorkoutDayEditor, ExerciseRow |
| Frontend TypeScript compiles | ✅ `tsc --noEmit` passes |
| Backend module imports | ✅ All modules load |
| Backend test suite | ✅ 8 tests covering core flows |

---

## Gym Administration Protection (Cross-Cutting)

**Files:** `backend/src/modules/users/users.service.js`, `backend/src/modules/super-admin/superAdmin.service.js`

**Change:** Added a guard in `updateUser` and `updateGymUser` that prevents deactivating or changing the role of the last active `GYM_ADMIN` in a gym.

**Logic:**
1. Before applying an update, check if the target user is a `GYM_ADMIN` with `status: 'active'`
2. If the update would set `status: 'inactive'` or change `role` away from `GYM_ADMIN`:
   - Count active `GYM_ADMIN` users in the gym excluding the target
   - If count is 0, return 400: *"Cannot deactivate or change role of the last active gym administrator."*

**Coverage:**
- `PATCH /api/v1/users/:id` (gym_admin route)
- `PATCH /api/v1/super-admin/gyms/:id/users/:userId` (super_admin route)
- Trainer deactivation not affected (trainers have `role: 'trainer'`, not `'gym_admin'`)
