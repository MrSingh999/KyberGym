# Member Payment Module — Architecture Audit

> Audit date: July 20, 2026
> Scope: Member Payment module only. Gym Subscription module excluded (already production-ready).

---

## Files Audited

### Backend — Member Payment Module
| File | Purpose |
|------|---------|
| `backend/src/modules/memberPayment/models/MemberPayment.model.js` | Mongoose schema for payments |
| `backend/src/modules/memberPayment/payment.service.js` | Business logic: record, list, get, refund |
| `backend/src/modules/memberPayment/payment.repository.js` | Data access: create, findById, findPaginated, update |
| `backend/src/modules/memberPayment/payment.controller.js` | Request handlers |
| `backend/src/modules/memberPayment/payment.routes.js` | Route definitions + middleware |
| `backend/src/modules/memberPayment/payment.validators.js` | Zod validation schemas |

### Backend — Related Modules
| File | Purpose |
|------|---------|
| `backend/src/modules/memberSubscription/models/MemberSubscription.model.js` | Subscription schema with paymentStatus |
| `backend/src/modules/memberSubscription/memberSubscription.service.js` | Creates subscription + auto-payment |
| `backend/src/modules/memberSubscription/memberSubscription.repository.js` | Data access for subscriptions |
| `backend/src/modules/memberSubscription/memberSubscription.validators.js` | Zod schemas for subscription |
| `backend/src/modules/memberSubscription/memberSubscription.routes.js` | Subscription routes |
| `backend/src/modules/member/models/Member.model.js` | Member schema with status |
| `backend/src/modules/member/member.repository.js` | Member data access |
| `backend/src/modules/member/member.service.js` | Member business logic |
| `backend/src/modules/membershipPlan/membershipPlan.repository.js` | Plan data access |
| `backend/src/modules/dashboard/dashboard.service.js` | Dashboard stats + due tracking |
| `backend/src/routes/index.js` | Central route aggregator |
| `backend/src/__tests__/payment.test.js` | Payment integration tests |
| `backend/src/__tests__/member-subscription.test.js` | Subscription integration tests |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/features/payments/types/index.ts` | Payment TypeScript types + enums |
| `frontend/src/features/payments/hooks/usePayments.ts` | React Query hooks (list, detail, dues, collect, refund) |
| `frontend/src/features/payments/schemas/payment.schema.ts` | Zod schemas for collect payment wizard |
| `frontend/src/features/payments/pages/PaymentsPage.tsx` | Payment list page |
| `frontend/src/features/payments/pages/PaymentDetailPage.tsx` | Payment detail page |
| `frontend/src/features/payments/pages/CollectPaymentPage.tsx` | Collect payment page |
| `frontend/src/features/payments/components/CollectPaymentWizard.tsx` | Multi-step collect payment form |
| `frontend/src/features/payments/components/PaymentsTable.tsx` | Data table |
| `frontend/src/features/payments/components/PaymentCard.tsx` | Card view |
| `frontend/src/features/payments/components/PaymentOverviewCard.tsx` | Detail breakdown card |
| `frontend/src/features/payments/components/PaymentStatusBadge.tsx` | Status badge |
| `frontend/src/features/payments/components/PaymentMethodIcon.tsx` | Method icon |
| `frontend/src/features/payments/components/DueWidget.tsx` | Due tracking widget |
| `frontend/src/features/payments/components/ReceiptPreview.tsx` | Printable receipt |
| `frontend/src/features/payments/components/PaymentsToolbar.tsx` | Toolbar with filters |
| `frontend/src/features/payments/components/PaymentsSearch.tsx` | Debounced search |
| `frontend/src/features/payments/components/PaymentsFilters.tsx` | Filter sidebar/sheet |
| `frontend/src/features/payments/components/BulkActionBar.tsx` | Bulk actions |
| `frontend/src/features/payments/components/EmptyPaymentsState.tsx` | Empty states |
| `frontend/src/features/payments/components/PaymentsSkeleton.tsx` | Loading skeletons |
| `frontend/src/features/payments/store/usePaymentStore.ts` | Zustand persisted store |
| `frontend/src/features/dashboard/hooks/useDashboardDues.ts` | Dashboard dues hook |
| `frontend/src/features/dashboard/components/ExpiringWidget.tsx` | Expiring memberships widget |
| `frontend/src/features/dashboard/components/QuickActions.tsx` | Quick actions with Record Payment |
| `frontend/src/routes/index.tsx` | Frontend route definitions |
| `frontend/src/constants/navigation.ts` | Navigation links |

---

## Audit Findings

### 1. Database Design

| Check | Verdict | Notes |
|-------|---------|-------|
| Primary key | ✅ | `publicId` with unique index + immutable |
| Gym tenant isolation | ✅ | `gymId` on every entity |
| References | ⚠️ | `subscriptionId` is optional, no FK enforcement at DB level |
| Denormalization | ✅ | No unnecessary denormalization |
| Field naming consistency | ⚠️ | `bankTransfer` (backend) vs `bank_transfer` (frontend type) |
| Indexes | ⚠️ | Missing: `subscriptionId` on MemberPayment, `status` on MemberPayment |
| Soft delete | ✅ | Member uses soft delete; payments use none (hard delete not exposed) |
| Public IDs | ✅ | MPAY- prefix, consistent pattern |

### 2. Payment Lifecycle

| Operation | Status | Issue |
|-----------|--------|-------|
| Payment Creation (independent) | ❌ | Does not update subscription `paymentStatus` or `lastPaymentDate` |
| Payment Creation (via subscription) | ⚠️ | No transaction wrapping payment + subscription update |
| Payment Refund | ❌ | Does not revert subscription `paymentStatus` to `unpaid` |
| Duplicate Detection | ❌ | No idempotency check, no dedup constraint |
| Race Condition Protection | ❌ | No MongoDB transactions or optimistic locking |
| Partial Payments | ❌ | Not supported — single `amount` field only |
| Discount Tracking | ⚠️ | Discount stored on subscription, not on payment record |
| Outstanding Balance | ❌ | No mechanism to track what a member owes |

### 3. Multi-Tenant Security

| Check | Verdict | Details |
|-------|---------|---------|
| gymId filtering | ✅ | All repository methods filter by gymId |
| Cross-gym access | ✅ | Impossible — gymId comes from tenant middleware |
| Role-based access | ✅ | GYM_ADMIN/STAFF for read/write, GYM_ADMIN only for refund |
| Feature flag | ✅ | `payments` feature flag on all routes |
| Ownership validation | ✅ | Member lookup within gym before payment creation |

### 4. Financial Integrity

| Check | Verdict | Details |
|-------|---------|---------|
| Atomic operations | ❌ | Payment creation and subscription state update are separate operations |
| Duplicate payments | ❌ | No protection against double charges on retry |
| Idempotency | ❌ | No idempotency key support |
| Audit trail | ⚠️ | No `refundedBy`/`refundedAt` on MemberPayment (exists on GymSubscriptionPayment) |
| Payment reconciliation | ❌ | Subscription `paymentStatus` can drift from actual payment state |

### 5. Performance

| Check | Verdict | Details |
|-------|---------|---------|
| MemberPayment indexes | ⚠️ | `{gymId, paymentDate}`, `{gymId, memberId}` — missing `subscriptionId`, `status` |
| MemberSubscription indexes | ✅ | `{gymId, memberId, status}`, `{gymId, endDate, status}` |
| Dashboard due tracking | ⚠️ | 4 separate queries with populate — acceptable for typical size, no pagination |
| N+1 queries | ⚠️ | Frontend does N+1 plan name lookups per payment list |
| Pagination | ✅ | Both backend and frontend support pagination |

### 6. API Design

| Check | Verdict | Details |
|-------|---------|---------|
| REST consistency | ✅ | Standard CRUD verbs |
| Response format | ✅ | Consistent `ApiSuccess` envelope |
| Input validation | ⚠️ | Refund route has NO validation middleware |
| Error responses | ✅ | Proper HTTP status codes + messages |
| ID format validation | ⚠️ | `GET /:id` has no param validation |

### 7. Code Quality

| Check | Verdict | Details |
|-------|---------|---------|
| Dead code | ⚠️ | `updatePaymentStatusSchema` defined but never used in routes |
| Error handling | ⚠️ | Auto-payment failure silently caught with `console.error` |
| Unused imports | ✅ | No obvious unused imports |
| Consistency | ✅ | Repository + Service + Controller pattern consistent with Gym Subscription module |

---

## Findings Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| Major | 5 |
| Minor | 6 |

### Critical Issues

**C1 — Payment recorded without updating subscription state** (`payment.service.js:8-31`)
`recordPayment` creates a payment document but never updates the linked subscription's `paymentStatus` or `lastPaymentDate`. The subscription remains `unpaid` permanently. The due tracking dashboard shows the member as overdue despite having paid.

**C2 — No atomicity for subscription + auto-payment** (`memberSubscription.service.js:57-79`)
When creating a subscription with `paymentMethod`, the payment creation and subscription `paymentStatus` update are two separate operations with no MongoDB transaction. If the second fails, the error is silently logged and the payment exists without the subscription reflecting it.

**C3 — Refund does not revert subscription state** (`payment.service.js:55-65`)
`refundPayment` sets payment status to `refunded` but never resets `paymentStatus` on the subscription back to `unpaid`. After refund, the member still shows as fully paid.

### Major Issues

**M1 — No duplicate payment protection**
No idempotency key, no unique constraint, no dedup check. Network retry creates double charges.

**M2 — `updatePaymentStatusSchema` defined but never used**
Validator exported in `payment.validators.js:15-19` but never imported in routes. Refund route accepts any body.

**M3 — Missing index on `subscriptionId` in MemberPayment**
Payment lookups by subscription unindexed — full collection scan.

**M4 — Frontend silently catches subscription lookup failure** (`usePayments.ts:246-254`)
`try/catch` wraps `GET /member-subscriptions`. On failure, `subscriptionId` is `undefined` and payment is orphaned.

**M5 — No `refundedBy` / `refundedAt` on MemberPayment**
Unlike `GymSubscriptionPayment`, no audit trail for refund actor or timestamp.

### Minor Issues

**m1 — `bankTransfer` vs `bank_transfer` naming mismatch**
Backend enum `bankTransfer`, frontend type `bank_transfer`. Requires manual mapping on every API call. One missed mapping causes silent display bug.

**m2 — Dashboard `getDueTracking` ignores `paymentStatus`**
Due tracking checks only `endDate` with `status: 'active'`. A member who never paid but has an active subscription period appears in due windows. A member who paid but expired is excluded.

**m3 — Subscription `paymentStatus` enum mismatch with payment lifecycle**
Subscription uses `unpaid`/`paid`, but payments have 4 statuses (`completed/pending/refunded/failed`). A refunded payment still shows subscription as `paid`.

**m4 — `transactionId` has no uniqueness constraint**
Two payments can reference the same external transaction ID. No dedup check on this field.

**m5 — No validation on `GET /payments/:id` param**
The `:id` parameter is passed through without format validation. Repository does best-effort parsing.

**m6 — API only supports single filter values for status/method**
Query accepts only one `status` and one `paymentMethod`. Frontend types support arrays but API does not.

---

## Production Readiness Score

**5 / 10**

---

## Final Verdict

**❌ Needs Refactoring Before Production**

Three critical issues (C1, C2, C3) break the core payment lifecycle:
- Payments recorded independently leave subscriptions in incorrect `unpaid` state
- Subscription creation + auto-payment has no rollback
- Refunds do not revert subscription state

No protection against duplicate payments (M1), which is unacceptable for financial transactions.

The architectural foundation is solid — proper multi-tenant isolation, consistent patterns, good frontend structure — but the financial integrity guarantees are insufficient for production.

**Do not deploy this module without first resolving all critical and major issues.**
