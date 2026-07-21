# Member Deletion Policy — Trainer Assignment Impact

## Current Behavior

Members are **soft-deactivated** (status set to `inactive`, `isDeleted` flag set) — never hard-deleted from the database.

Trainer-member assignments in `TrainerMemberAssignment` collection:
- **Remain in the database** for audit history.
- Active assignments (`status: 'ACTIVE'`) to a deactivated member still exist but serve no operational purpose since the member cannot use gym services.
- The `assignMembers` service validates against `status: 'active'` and `isDeleted: { $ne: true }`, so deactivated members cannot be newly assigned.

## If Hard Deletion Is Introduced in the Future

If a future phase introduces hard deletion of Member documents, the following must be handled:

1. **Orphaned Assignments**: `TrainerMemberAssignment.memberId` would reference a non-existent document. Queries that populate `memberId` would return `null`.
2. **Mitigation Options**:
   - Add a `pre('remove')` or `pre('deleteOne')` hook on the Member model that sets all related `TrainerMemberAssignment` records to `status: 'INACTIVE'` with a system `removedBy` marker.
   - Or, before hard-deleting a member, iterate their active trainer assignments and remove them (soft).
3. **Recommended Approach**: Soft-delete is preferred for this system. If hard deletion must be supported, use a Mongoose middleware hook to clean up related assignments atomically.

## Current Safeguards

- `assignMembers` service already validates member exists with `status: 'active'` and `isDeleted: { $ne: true }`.
- The `TrainerMemberAssignment` compound unique index with partial filter `{ status: 'ACTIVE' }` prevents duplicate active assignments regardless of member state.
- Audit trail (`assignedBy`, `removedBy`, `assignedAt`, `removedAt`) is preserved regardless of member state.

## Summary

No code changes required for Phase 2.3. The current soft-delete policy ensures trainer-member assignments remain intact for audit purposes. If hard deletion is adopted later, a Mongoose hook on the Member model should soft-remove related assignments.
