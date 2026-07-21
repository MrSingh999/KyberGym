# Phase 2.1 — Workout Template Library Implementation Plan

## Overview

Refactor the existing workout module from a "workout program with member assignment" to a **Workout Template Library**. This phase focuses exclusively on template creation and management — no member assignment, tracking, or analytics.

---

## 1. Backend — Workout Model

**File:** `backend/src/modules/workouts/models/Workout.model.js`

| Change | Detail |
|---|---|
| **Add** `goal` | `String`, optional, free-text (NOT enum) |
| **Add** `estimatedDuration` | `Number`, optional, in minutes |
| **Add** `category` | `String`, optional (Upper Body, Lower Body, PPL, Cardio, HIIT, Strength, etc.) |
| **Add** `status` | `String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'ACTIVE'` — create defaults to ACTIVE; frontend can offer "Save as Draft" if needed |
| **Add** `isDeleted` | `Boolean, default: false` — independent soft delete |
| **Remove** `isActive` | Replaced by `status` |
| **Remove** `assignmentType` | Not in scope for Phase 2.1 |
| **Remove** `assignedMembers` | Not in scope for Phase 2.1 |
| **Keep** `title` | Unchanged |
| **Keep** `description` | Unchanged |
| **Keep** `createdBy` | Audit trail |

**Indexes:**
- `{ gymId: 1, isDeleted: 1 }`
- `{ gymId: 1, status: 1 }`
- Search uses basic regex on `title` and `goal` — skip MongoDB text index for now unless performance issues arise

---

## 2. Backend — WorkoutDay Model

**File:** `backend/src/modules/workoutDay/models/WorkoutDay.model.js`

| Change | Detail |
|---|---|
| **Rename** `dayNumber` → `orderIndex` | `Number, required` — supports drag-drop reorder (client sends updated indexes) |
| **Keep** `dayName` | `String, required` |
| **Keep** `title` | `String, optional` — NOT renamed to notes; kept as-is |
| **Update unique index** | `(workoutId, orderIndex)` instead of `(workoutId, dayNumber)` |

---

## 3. Backend — Exercise Schema (Embedded)

**File:** `backend/src/modules/workoutDay/models/WorkoutDay.model.js`

| Change | Detail |
|---|---|
| **Keep** `name` | `String, required` |
| **Keep** `sets` | `Number, optional` |
| **Keep** `reps` | `Number, optional` |
| **Keep** `duration` | `Number, optional` (seconds) — keep existing field |
| **Keep** `notes` | `String, optional` |
| **Keep** `image` | `String, optional` — keep for future use |
| **Keep** `videoUrl` | `String, optional` — keep for future use |
| **Add** `restTime` | `Number, optional` (seconds) |
| **Add** `order` | `Number, default: 0` — exercise ordering within a day |
| **Add** `exerciseId` | `ObjectId, ref: 'Exercise', default: null` — future Exercise Library prep |
| **Not added** `tempo` | Not in scope |

---

## 4. Backend — Validator Updates

**File:** `backend/src/modules/workouts/workout.validators.js`

### `createWorkoutSchema`
```javascript
body: z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  goal: z.string().trim().max(100).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  category: z.string().trim().max(50).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional().default('ACTIVE'),
})
```

### `updateWorkoutSchema`
Same fields as above, all optional. `status` can be included to toggle between DRAFT / ACTIVE / ARCHIVED — no separate archive/restore endpoints needed.

### `createWorkoutDaySchema`
```javascript
body: z.object({
  orderIndex: z.number().int().min(0),
  dayName: z.string().trim().min(1).max(50),
  title: z.string().trim().max(100).optional(),
  exercises: z.array(exerciseSchema).optional().default([]),
})
```

### `updateWorkoutDaySchema`
Same fields, all optional.

### `exerciseSchema`
```javascript
z.object({
  name: z.string().trim().min(1).max(100),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  restTime: z.number().positive().optional(),
  notes: z.string().trim().max(300).optional(),
  order: z.number().int().min(0).optional(),
  exerciseId: z.string().optional().nullable(),
  image: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
})
```

### `nestedSaveSchema` (new)
Body schema for `PUT /workouts/:id/nested`:
```javascript
body: z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  goal: z.string().trim().max(100).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  category: z.string().trim().max(50).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  days: z.array(z.object({
    _id: z.string().optional(),   // existing day has _id
    dayName: z.string().trim().min(1).max(50),
    title: z.string().trim().max(100).optional(),
    orderIndex: z.number().int().min(0),
    exercises: z.array(exerciseSchema).optional().default([]),
  })),
})
```

---

## 5. Backend — New API Endpoints

**File:** `backend/src/modules/workouts/workout.routes.js`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/workouts/:id/duplicate` | GYM_ADMIN, TRAINER | Duplicate workout with days + exercises |
| `PATCH` | `/workouts/:id/status` | GYM_ADMIN, TRAINER | Update status (DRAFT / ACTIVE / ARCHIVED) — replaces need for separate archive/restore endpoints |
| `PUT` | `/workouts/:id/nested` | GYM_ADMIN, TRAINER | Nested save — update workout + days + exercises in one call |
| `GET` | `/workouts` | GYM_ADMIN, STAFF, TRAINER | Enhanced: `?search=`, `?status=`, `?sort=`, `?order=` |

**Enhanced GET /workouts behavior:**
- Base filter: `{ gymId, isDeleted: false }`
- `?status=DRAFT|ACTIVE|ARCHIVED` → adds `{ status }`
- `?search=term` → `$or: [{ title: regex }, { goal: regex }]`
- `?sort=title|createdAt|updatedAt` + `?order=asc|desc`
- Always exclude `isDeleted: true`

**DELETE /workouts/:id behavior:**
- Sets `isDeleted: true` only — does NOT change `status`
- `isDeleted` and `status` are independent concepts
- Does NOT remove from database

---

## 6. Backend — Service Layer Updates

**File:** `backend/src/modules/workouts/workout.service.js`

| Method | Action |
|---|---|
| `createWorkout` | Remove member resolution logic. Accept new fields. |
| `getWorkouts` | Support search, status filter, sorting. Exclude `isDeleted`. |
| `getWorkoutById` | Unchanged (loads with days). |
| `updateWorkout` | Remove member logic. Accept new fields including `status`. |
| `deleteWorkout` | Set `isDeleted: true` only — does NOT change `status`. |
| `duplicateWorkout` | **New**: Clone workout + days + exercises. Name: "Original (Copy)", "Original (Copy 2)", etc. |
| `archiveWorkout` | **New**: Set `status: 'ARCHIVED'`. Restore is just a normal `updateWorkout` with `status: 'ACTIVE'` or `status: 'DRAFT'` — no separate restore endpoint. |
| `saveNestedWorkout` | **New**: Smart diff — update existing days, insert new, delete removed. Same for exercises within each day. |

### Duplicate Name Logic
```
function getCopyName(originalName: string, existingNames: string[]): string {
  if (!existingNames.includes(`${originalName} (Copy)`)) {
    return `${originalName} (Copy)`;
  }
  let counter = 2;
  while (existingNames.includes(`${originalName} (Copy ${counter})`)) {
    counter++;
  }
  return `${originalName} (Copy ${counter})`;
}
```

### Nested Save Logic
```
function saveNestedWorkout(workoutId, gymId, { days: incomingDays, ...workoutData }) {
  // 1. Update workout metadata
  updateWorkout(workoutId, gymId, workoutData);

  // 2. Get existing day IDs
  const existingDays = await WorkoutDay.find({ workoutId }).select('_id');
  const existingIds = existingDays.map(d => d._id.toString());
  const incomingIds = incomingDays.filter(d => d._id).map(d => d._id);

  // 3. Delete removed days (and their exercises implicitly)
  const toDelete = existingIds.filter(id => !incomingIds.includes(id));
  await WorkoutDay.deleteMany({ _id: { $in: toDelete }, workoutId });

  // 4. Upsert each incoming day
  for (const day of incomingDays) {
    if (day._id && existingIds.includes(day._id)) {
      // Update existing — diff exercises too
      updateDayWithExerciseDiff(day._id, workoutId, gymId, day);
    } else {
      // Create new
      createDay(gymId, workoutId, day);
    }
  }
}
```

---

## 7. Backend — Disable Member-Facing Code (Keep Implementation)

Keep existing member workout code intact — do NOT delete methods. Only disable the routes so they are not accessible.

| File | Action |
|---|---|
| `workout.service.js` `getWorkoutsForMember()` | Keep method body, just comment out or disable the route |
| `workout.repository.js` `findForMember()` | Keep — will be reused in later phase |
| `workout.controller.js` — any member handlers | Keep |
| `workout.routes.js` — any member routes | Comment out route registration, keep import |

---

## 8. Frontend — Types

**File:** `frontend/src/features/workouts/types/index.ts`

```typescript
export type WorkoutStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface Exercise {
  _id?: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  order: number;
  exerciseId?: string | null;
  image?: string;
  videoUrl?: string;
}

export interface WorkoutDay {
  _id?: string;
  workoutId: string;
  orderIndex: number;
  dayName: string;
  title?: string;
  exercises: Exercise[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workout {
  _id: string;
  gymId: string;
  title: string;
  description?: string;
  goal?: string;
  estimatedDuration?: number;
  category?: string;
  status: WorkoutStatus;
  isDeleted: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutWithDays extends Workout {
  days: WorkoutDay[];
}

export interface WorkoutListItem {
  id: string;
  title: string;
  description?: string;
  goal?: string;
  category?: string;
  estimatedDuration?: number;
  status: WorkoutStatus;
  daysCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutFilters {
  status?: WorkoutStatus;
}

export type WorkoutSortField = "title" | "createdAt" | "updatedAt";
export type SortDir = "asc" | "desc";
```

---

## 9. Frontend — Zod Schemas

**File:** `frontend/src/features/workouts/schemas/workout.schema.ts`

```typescript
export const exerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required").max(100),
  sets: z.coerce.number().int().min(0).optional(),
  reps: z.coerce.number().int().min(0).optional(),
  duration: z.coerce.number().min(0).optional(),
  restTime: z.coerce.number().min(0).optional(),
  notes: z.string().max(300).optional(),
  order: z.coerce.number().int().min(0).optional(),
  exerciseId: z.string().optional().nullable(),
  image: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const workoutDaySchema = z.object({
  orderIndex: z.coerce.number().int().min(0),
  dayName: z.string().min(1, "Day name is required").max(50),
  title: z.string().max(100).optional(),
  exercises: z.array(exerciseSchema),
});

export const createWorkoutSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  goal: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
});

export const updateWorkoutSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  goal: z.string().max(100).optional(),
  estimatedDuration: z.coerce.number().int().positive().optional(),
  category: z.string().max(50).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});
```

---

## 10. Frontend — New Single-Page Workout Editor

**File:** `frontend/src/features/workouts/pages/WorkoutEditorPage.tsx` (NEW)

Replaces `CreateWorkoutPage.tsx` and `EditWorkoutPage.tsx`.

**Route:** `/admin/workouts/new` (create) and `/admin/workouts/:workoutId/edit` (edit)

**Layout (single scrolling page):**

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Workouts                 Save            │
├─────────────────────────────────────────────────────┤
│  ┌─ Workout Information ──────────────────────────┐ │
│  │  Title*: [________________________]            │ │
│  │  Description: [textarea]                       │ │
│  │  Goal: [________]      Category: [________]    │ │
│  │  Est. Duration: [____] min  Status: [ACTIVE ▼] │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─ Workout Days ──────────────────────────────────┐ │
│  │  [▲] [▼]  Day 1 — Push Day          [✕] [Edit] │ │
│  │    ┌ Exercise 1: Bench Press                    │ │
│  │    │ Sets: 4  Reps: 10  Rest: 60s  Order: 1    │ │
│  │    │ Notes: [________________]                  │ │
│  │    └──────────────────────────────────────────- │ │
│  │    ┌ Exercise 2: Shoulder Press                 │ │
│  │    │ ...                                       │ │
│  │    └──────────────────────────────────────────- │ │
│  │  [+ Add Exercise]                               │ │
│  │                                                 │ │
│  │  [▲] [▼]  Day 2 — Pull Day          [✕] [Edit] │ │
│  │  ...                                           │ │
│  │                                                 │ │
│  │  [+ Add Day]                                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  [Save]  [Duplicate]  [Archive]  [Delete]             │
└─────────────────────────────────────────────────────┘
```

### Create Mode
- `POST /workouts` to create the workout
- Then immediately `PUT /workouts/:id/nested` to save days + exercises
- Or: create empty workout, then navigate to edit mode

### Edit Mode
- Load existing workout with days via `useWorkout(id)`
- On save: call `PUT /workouts/:id/nested`

### Components to Build

**WorkoutInfoSection.tsx** (NEW)
- Title, Description, Goal, Category, Estimated Duration, Status
- Goal input with autocomplete suggestions (Weight Loss, Muscle Gain, Strength, General Fitness, Women Fitness, Senior Citizen, Rehabilitation, CrossFit, Powerlifting)

**WorkoutDayEditor.tsx** (NEW)
- Up/Down arrow buttons to reorder days (no drag-and-drop library dependency)
- Each day card has: Day Name, Title, Order Index (auto), Notes
- Up/Down buttons swap `orderIndex` with adjacent day on click
- Works cleanly on both desktop and mobile without extra dependencies

**ExerciseRow.tsx** (NEW)
- Compact inline form: Name, Sets, Reps, Duration, Rest Time, Order, Notes
- Remove button

---

## 11. Frontend — Workout List Page Updates

**File:** `frontend/src/features/workouts/pages/WorkoutsPage.tsx`

### Search
- Client-side search by name AND goal (backup) — but ideally send to backend
- Update `useWorkouts` to pass `search` param to API

### Filters
- Replace `isActive` filter with `Status` dropdown: All / Draft / Active / Archived
- Remove `assignmentType` filter

### Card/Table View
Fields to display:
- Title
- Description (truncated)
- Goal (badge/tag)
- Category (badge)
- Estimated Duration
- Status badge (Draft=gray, Active=green, Archived=orange)
- Days count
- Created / Updated dates

### Actions
Per workout in dropdown:
- Edit → navigates to editor
- Duplicate → calls duplicate API
- Archive → sets status to ARCHIVED (restore by editing and setting status back to ACTIVE/DRAFT)
- Delete → soft delete with confirmation modal

---

## 12. Frontend — Workout Detail Page Updates

**File:** `frontend/src/features/workouts/pages/WorkoutDetailPage.tsx`

- Remove member assignment section
- Remove assignment type badge
- Add: Goal, Category, Estimated Duration display
- Update stats row: Days, Exercises, Duration
- Update Status badge for DRAFT/ACTIVE/ARCHIVED
- Actions: Edit → navigates to WorkoutEditorPage, Duplicate, Archive (restore by editing status), Delete
- Keep day accordion display with exercises

---

## 13. Frontend — Hooks Updates

**File:** `frontend/src/features/workouts/hooks/useWorkouts.ts`

| Hook | Change |
|---|---|
| `useWorkouts` | Send `search`, `status`, `sort`, `order` as query params |
| `useWorkout` | Return new types; remove member data mapping |
| `useCreateWorkout` | Accept new `CreateWorkoutData` type |
| `useUpdateWorkout` | Accept new `UpdateWorkoutData` type |
| `useDeleteWorkout` | Stays same (soft delete) |
| `useDuplicateWorkout` | **New**: `POST /workouts/:id/duplicate` |
| `useArchiveWorkout` | **New**: `PATCH /workouts/:id/archive` |
| `useSaveNestedWorkout` | **New**: `PUT /workouts/:id/nested` |
| `useMemberWorkouts` | **Keep** — keep hook and types; only disable the route in the router |
| `useCreateWorkoutDay` | Keep |
| `useUpdateWorkoutDay` | Keep |
| `useDeleteWorkoutDay` | Keep |

---

## 14. Frontend — Store Updates

**File:** `frontend/src/features/workouts/store/useWorkoutStore.ts`

- `WorkoutFilters`: change to `{ status?: WorkoutStatus }`
- Remove `assignmentType` filter
- Keep: `searchQuery`, `sortField`, `sortDir`, `viewMode`

---

## 15. Frontend — Route Updates

**File:** `frontend/src/routes/index.tsx`

| Route | Change |
|---|---|
| `/admin/workouts` | Keep |
| `/admin/workouts/:workoutId` | Keep — updated detail page |
| `/admin/workouts/new` | Point to `WorkoutEditorPage` |
| `/admin/workouts/:workoutId/edit` | Point to `WorkoutEditorPage` |
| `/member/workout-plan` | Keep but comment out or show disabled state |
| `/member/workouts` | Keep but comment out or show disabled state |

---

## 16. Frontend — Status Badge Updates

**File:** `frontend/src/features/workouts/components/WorkoutStatusBadge.tsx`

Replace `{ isActive: boolean }` with `{ status: WorkoutStatus }`:

- DRAFT → Gray/"Draft"
- ACTIVE → Green/"Active"
- ARCHIVED → Orange/"Archived"

---

## 17. Navigation Updates

**File:** `frontend/src/constants/navigation.ts`

- Keep "Workouts" in sidebar under Gym Activity
- Keep "Exercises" as placeholder for future library (no changes)

---

## 18. Migration & Seeder

**File:** `backend/src/database/seeder.js`

- Update seeded workouts: add `goal`, `category`, `estimatedDuration`, `status`
- Update seeded days: add `orderIndex`, keep `dayName`, `title`
- Update seeded exercises: add `restTime`, `order`, `exerciseId`, keep `duration`, `image`, `videoUrl`

---

## 19. Test Updates

**File:** `backend/src/__tests__/workout.test.js`

### Update Existing Tests
- Replace `isActive` assertions with `status` assertions
- Replace `dayNumber` with `orderIndex`
- Update request bodies to match new schemas

### New Tests

| Test | Coverage |
|---|---|
| Create workout with all new fields | goal, estimatedDuration, category, status=ACTIVE |
| Create workout defaults to ACTIVE | Status field default |
| Update workout status | PATCH status from ACTIVE→ARCHIVED or ACTIVE→DRAFT |
| Archive workout | PATCH /workouts/:id/status → status=ARCHIVED |
| Duplicate workout | Days and exercises copied; name format "X (Copy)" |
| Duplicate with existing copy | Generates "X (Copy 2)", "X (Copy 3)" |
| Soft delete | DELETE → isDeleted=true; status unchanged; GET does not return it |
| Nested save — update day | Modify existing day's fields |
| Nested save — add day | Insert new day with exercises |
| Nested save — remove day | Delete day not in incoming array |
| Nested save — exercise diff | Update/insert/remove exercises within a day |
| Search by name | `?search=chest` returns matching workouts |
| Search by goal | `?search=weight` matches goal field |
| Filter by status | `?status=ACTIVE` |
| Sort by title | `?sort=title&order=asc` |
| Sort by updatedAt | `?sort=updatedAt&order=desc` |
| Estimated Duration optional | Create without estimatedDuration succeeds |
| Category optional | Create without category succeeds |
| Goal is free-text | Any string accepted, not enum |

---

## 20. Files Summary

### Files to Create (4)
| File | Purpose |
|---|---|
| `frontend/src/features/workouts/pages/WorkoutEditorPage.tsx` | Unified create/edit single-page editor |
| `frontend/src/features/workouts/components/WorkoutInfoSection.tsx` | Workout metadata form section |
| `frontend/src/features/workouts/components/WorkoutDayEditor.tsx` | Day list with Up/Down reorder buttons and exercises |
| `frontend/src/features/workouts/components/ExerciseRow.tsx` | Compact exercise form row |

### Files to Modify (25)
| File | Key Changes |
|---|---|
| `backend/src/modules/workouts/models/Workout.model.js` | Schema: add goal, estimatedDuration, category, status, isDeleted; remove assignmentType, assignedMembers |
| `backend/src/modules/workoutDay/models/WorkoutDay.model.js` | Schema: dayNumber→orderIndex; exercise: add restTime, order, exerciseId |
| `backend/src/modules/workouts/workout.service.js` | Keep member methods, add duplicate, archive, nested save, search |
| `backend/src/modules/workouts/workout.repository.js` | Update queries for new schema + search + isDeleted filter |
| `backend/src/modules/workouts/workout.controller.js` | Add duplicate, archive, status, nested save handlers |
| `backend/src/modules/workouts/workout.routes.js` | Add new endpoints |
| `backend/src/modules/workouts/workout.validators.js` | Update all schemas |
| `backend/src/__tests__/workout.test.js` | Update + expand tests |
| `frontend/src/features/workouts/types/index.ts` | New types |
| `frontend/src/features/workouts/schemas/workout.schema.ts` | New schemas |
| `frontend/src/features/workouts/hooks/useWorkouts.ts` | New hooks + updated types |
| `frontend/src/features/workouts/store/useWorkoutStore.ts` | status filter, remove assignmentType filter |
| `frontend/src/features/workouts/pages/WorkoutsPage.tsx` | Search, status filter, new columns, duplicate/archive actions |
| `frontend/src/features/workouts/pages/WorkoutDetailPage.tsx` | Remove member section, add goal/category/duration display |
| `frontend/src/features/workouts/components/WorkoutCard.tsx` | New fields display |
| `frontend/src/features/workouts/components/WorkoutsTable.tsx` | New columns, duplicate/archive dropdown actions |
| `frontend/src/features/workouts/components/WorkoutToolbar.tsx` | Status filter dropdown, search placeholder update |
| `frontend/src/features/workouts/components/WorkoutStatusBadge.tsx` | Draft/Active/Archived |
| `frontend/src/features/workouts/components/WorkoutDayForm.tsx` | orderIndex, keep title |
| `frontend/src/features/workouts/components/WorkoutDayCard.tsx` | Display orderIndex, new exercise fields |
| `frontend/src/features/workouts/components/ExerciseForm.tsx` | Add restTime, order, exerciseId |
| `frontend/src/features/workouts/components/WorkoutForm.tsx` | Update for new fields (or replaced by editor) |
| `frontend/src/features/workouts/components/EmptyWorkoutsState.tsx` | Messaging updates |
| `frontend/src/routes/index.tsx` | Point to WorkoutEditorPage |
| `backend/src/database/seeder.js` | Seed data updates |

### Files to Remove from Routes (2)
| File | Action |
|---|---|
| `frontend/src/features/workouts/pages/CreateWorkoutPage.tsx` | Replaced by WorkoutEditorPage |
| `frontend/src/features/workouts/pages/EditWorkoutPage.tsx` | Replaced by WorkoutEditorPage |

### Files to Keep but Deactivate from Routes (2)
| File | Action |
|---|---|
| `frontend/src/features/workouts/pages/MemberWorkoutPlanPage.tsx` | Comment out route; keep file and all code for later phase |
| `backend/src/modules/workouts/workout.routes.js` — member routes | Comment out route registration; keep imports and handler code |

---

## 21. Implementation Order

1. **Backend model + validator updates** — update Workout + WorkoutDay schemas, validators
2. **Backend service + repository updates** — refactor existing methods, add new ones (duplicate, archive, nested save); keep member methods
3. **Backend controller + route updates** — add new endpoints, disable member endpoints (keep code)
4. **Backend tests** — update existing, add new
5. **Seeder update**
6. **Frontend types + schemas + store** — data layer first
7. **Frontend hooks** — update existing, add new
8. **Frontend components** — ExerciseRow, WorkoutInfoSection, WorkoutDayEditor
9. **Frontend pages** — WorkoutEditorPage, update WorkoutsPage, update WorkoutDetailPage, update WorkoutCard, update WorkoutsTable
10. **Frontend routes** — point to new pages, disable member routes (keep code)
11. **Frontend test / manual verification**
