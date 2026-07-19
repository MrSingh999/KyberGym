import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/types";
import { renewMembershipSchema, RenewMembershipData } from "../schemas/member.schema";
import { useRenewMembership } from "../hooks/useMemberProfile";

interface RenewMembershipDialogProps {
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

export function RenewMembershipForm({ memberId, memberName, onSuccess }: RenewMembershipDialogProps) {
  const { mutateAsync, isPending } = useRenewMembership(memberId);

  const { data: plansData } = usePlans({ pageSize: 100 });
  const activePlans = useMemo(() => plansData?.data?.filter(p => p.status === 'active') || [], [plansData]);

  const form = useForm<RenewMembershipData>({
    resolver: zodResolver(renewMembershipSchema),
    defaultValues: {
      planId: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      paymentMethod: "cash" as const,
    },
  });

  const selectedPlanId = form.watch("planId");
  const startDateVal = form.watch("startDate");

  // Auto calculate end date
  useEffect(() => {
    if (selectedPlanId && startDateVal) {
      const plan = activePlans.find(p => p.id === selectedPlanId);
      if (plan) {
        let durationInDays = plan.duration;
        if (plan.durationType === 'weeks') durationInDays = plan.duration * 7;
        if (plan.durationType === 'months') durationInDays = plan.duration * 30;
        if (plan.durationType === 'years') durationInDays = plan.duration * 365;

        const start = new Date(startDateVal);
        if (!isNaN(start.getTime())) {
          const end = addDays(start, durationInDays);
          form.setValue("endDate", format(end, "yyyy-MM-dd"));
        }
      }
    }
  }, [selectedPlanId, startDateVal, activePlans, form]);

  const onSubmit = async (data: RenewMembershipData) => {
    try {
      const now = new Date();
      const start = data.startDate ? new Date(data.startDate) : now;
      let startDateStr = start.toISOString();
      if (start.toDateString() === now.toDateString()) {
        startDateStr = now.toISOString();
      }

      await mutateAsync({
        planId: data.planId,
        startDate: startDateStr,
        endDate: data.endDate
      });
      toast.success(`Membership renewed for ${memberName}`);
      onSuccess();
    } catch (e: any) {
      const errMsg = e.response?.data?.message || "Failed to renew membership. Please try again.";
      toast.error(errMsg);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2 animate-fade-slide-up">
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="">Select a plan...</option>
                  {activePlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} (₹{plan.price})
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" readOnly {...field} className="bg-surface-hover cursor-not-allowed text-text-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="" disabled>Select method...</option>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Renewing...">
          Confirm Renewal
        </LoadingButton>
      </form>
    </Form>
  );
}
