# Trainer Management API Documentation

> Base path: `/api/v1/trainers`
> All routes require `x-tenant-id` header and `Authorization: Bearer <token>`.

---

## Owner-Only Routes (require `gym_admin` role)

### `POST /api/v1/trainers` — Create Trainer

**Roles:** `gym_admin`

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | string | yes | 2–100 characters |
| `email` | string | yes | Valid email, unique per gym |
| `password` | string | yes | Minimum 6 characters |
| `phone` | string | no | |
| `specialization` | string | no | Max 100 characters |

**Response (201):**
```json
{
  "success": true,
  "message": "Trainer created",
  "data": {
    "_id": "...",
    "publicId": "TRN-...",
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "specialization": "...",
    "status": "ACTIVE",
    "joiningDate": "2026-07-21T...",
    "memberCount": 0,
    "user": { "_id": "...", "name": "...", "email": "...", "role": "trainer", "status": "active" }
  }
}
```

**Validation Errors:** 400 — Missing required fields, invalid email, password too short, duplicate email (409).

---

### `GET /api/v1/trainers` — List Trainers

**Roles:** `gym_admin`

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Searches `fullName`, `email`, `phone`, `specialization` (case-insensitive) |
| `status` | enum | — | Filter: `ACTIVE` or `INACTIVE` |
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | enum | `createdAt` | Sort field: `fullName`, `joiningDate` |
| `order` | enum | `desc` | Sort order: `asc` or `desc` |

**Response (200):**
```json
{
  "success": true,
  "message": "Trainers retrieved",
  "data": [
    {
      "_id": "...",
      "publicId": "TRN-...",
      "fullName": "...",
      "email": "...",
      "phone": "...",
      "specialization": "...",
      "status": "ACTIVE",
      "joiningDate": "...",
      "memberCount": 5,
      "user": { "_id": "...", "name": "...", "lastLogin": "..." }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
}
```

**Notes:** `memberCount` is computed via aggregation (single query, no N+1). Returns `lastLogin` from the linked User document.

---

### `GET /api/v1/trainers/:id` — Get Trainer by ID

**Roles:** `gym_admin`

**Path Parameters:** `id` — TrainerProfile `_id` or `publicId`

**Response (200):** Single trainer object (same shape as list item above).

**Error:** 404 — Trainer not found.

---

### `PATCH /api/v1/trainers/:id` — Update Trainer

**Roles:** `gym_admin`

**Request Body:** (all optional, partial update)

| Field | Type | Description |
|---|---|---|
| `fullName` | string | 2–100 characters. Also syncs to linked User `name`. |
| `email` | string | Valid email. Also syncs to linked User `email`. |
| `phone` | string | Also syncs to linked User `phone`. |
| `specialization` | string | Max 100 characters |
| `status` | enum | `ACTIVE` or `INACTIVE` |

**Response (200):** Updated trainer object.

**Error:** 404 — Trainer not found.

---

### `POST /api/v1/trainers/:id/deactivate` — Deactivate Trainer

**Roles:** `gym_admin`

**Path Parameters:** `id` — TrainerProfile `_id` or `publicId`

**Behavior:**
- Sets `TrainerProfile.status = 'INACTIVE'`
- Sets `User.status = 'inactive'` (prevents login)
- Existing member assignments remain unchanged

**Response (200):** Trainer object with `status: "INACTIVE"`.

**Error:** 404 — Trainer not found.

---

### `POST /api/v1/trainers/:id/activate` — Reactivate Trainer

**Roles:** `gym_admin`

**Behavior:**
- Sets `TrainerProfile.status = 'ACTIVE'`
- Sets `User.status = 'active'` (restores login)

**Response (200):** Trainer object with `status: "ACTIVE"`.

---

### `POST /api/v1/trainers/:id/assign-members` — Assign Members to Trainer

**Roles:** `gym_admin`

**Path Parameters:** `id` — TrainerProfile `_id` or `publicId`

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberIds` | string[] | yes | Array of Member `_id`s. Min 1, max 100. |

**Validation:**
- Array length must be between 1 and `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST` (100).
- All members must belong to the same gym and have `status: 'active'`.
- Trainer must be `ACTIVE`.
- Duplicate active assignments are silently skipped.

**Response (201):**
```json
{
  "success": true,
  "message": "Members assigned",
  "data": { "assigned": 3, "skipped": 1, "failed": 0 }
}
```

**Notes:** `assigned` = newly created assignments. `skipped` = already had an active assignment. `failed` = reserved for future use (always 0).

---

### `GET /api/v1/trainers/:id/members` — List Trainer's Assigned Members

**Roles:** `gym_admin`

**Path Parameters:** `id` — TrainerProfile `_id` or `publicId`

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "trainerId": "...",
      "memberId": { "_id": "...", "fullName": "...", "email": "...", "phone": "...", "memberCode": "...", "status": "active" },
      "assignedAt": "...",
      "status": "ACTIVE"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### `DELETE /api/v1/trainers/:id/members/:assignmentId` — Remove Member Assignment

**Roles:** `gym_admin`

**Path Parameters:**
- `id` — TrainerProfile `_id` or `publicId`
- `assignmentId` — TrainerMemberAssignment `_id` or `publicId`

**Behavior:** Soft delete — sets `status: 'INACTIVE'`, records `removedBy` and `removedAt`.

**Response (200):** Updated assignment object with `status: "INACTIVE"`.

---

## Trainer Self-Service Routes (require `trainer` role)

### `GET /api/v1/trainers/me/profile` — Get My Profile

**Roles:** `trainer`

**Response (200):** Trainer profile with `memberCount` (active assigned members count).

### `PATCH /api/v1/trainers/me/profile` — Update My Profile

**Roles:** `trainer`

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `phone` | string | no | Phone number only. Other fields are owner-controlled. |

**Response (200):** Updated trainer profile.

**Notes:** Trainers can only update their phone number. Full name, email, specialization, joining date, and status are owner-controlled.

### `GET /api/v1/trainers/me/members` — Get My Assigned Members

**Roles:** `trainer`

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |

**Response (200):** Same shape as owner `GET /:id/members`.

---

## Error Reference

| Status | Meaning |
|---|---|
| 400 | Validation error (invalid input, inactive trainer, cross-gym member) |
| 401 | Missing or invalid token |
| 403 | Insufficient role (not `gym_admin` or `trainer` as required) |
| 404 | Resource not found (trainer, assignment, or member) |
| 409 | Duplicate trainer email |
| 500 | Server error |

---

## Constants

| Constant | Value | Location |
|---|---|---|
| `MAX_MEMBER_ASSIGNMENTS_PER_REQUEST` | 100 | `trainer.constants.js` |
| `DEFAULT_PAGE_SIZE` | 20 | `trainer.constants.js` |
| `MAX_PAGE_SIZE` | 100 | `trainer.constants.js` |
