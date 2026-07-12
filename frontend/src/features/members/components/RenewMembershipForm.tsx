import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/forms/Form";
import { Input } from "../../../../components/ui/Input";
import { LoadingButton } from "../../../../components/ui/Button";
import { renewMembershipSchema, RenewMembershipData } from "../schemas/member.schema";
import { useRenewMembership } from "../hooks/useMemberProfile";

interface RenewMembershipDialogProps {
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

export function RenewMembershipForm({ memberId, memberName, onSuccess }: RenewMembershipDialogProps) {
  const { mutateAsync, isPending } = useRenewMembership(memberId);

  const form = useForm<RenewMembershipData>({
    resolver: zodResolver(renewMembershipSchema),
    defaultValues: {
      planId: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    },
  });

  const onSubmit = async (data: RenewMembershipData) => {
    try {
      await mutateAsync(data);
      toast.success(`Membership renewed for ${memberName}`);
      onSuccess();
    } catch {
      toast.error("Failed to renew membership. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <Input placeholder="Select a plan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
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
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <LoadingButton type="submit" className="w-full" isLoading={isPending} loadingText="Renewing...">
          Confirm Renewal
        </LoadingButton>
      </form>
    </Form>
  );
}
