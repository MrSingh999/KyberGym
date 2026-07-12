import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/forms/Form";
import { Textarea } from "../../../../components/ui/Textarea";
import { LoadingButton, Button } from "../../../../components/ui/Button";
import { suspendMemberSchema, SuspendMemberData } from "../schemas/member.schema";
import { useSuspendMember, useActivateMember } from "../hooks/useMemberProfile";

// -- Suspend Form --
interface SuspendMemberFormProps {
  memberId: string;
  memberName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SuspendMemberForm({ memberId, memberName, onSuccess, onCancel }: SuspendMemberFormProps) {
  const { mutateAsync, isPending } = useSuspendMember(memberId);

  const form = useForm<SuspendMemberData>({
    resolver: zodResolver(suspendMemberSchema),
    defaultValues: { reason: "" },
  });

  const onSubmit = async (data: SuspendMemberData) => {
    try {
      await mutateAsync(data);
      toast.success(`${memberName}'s membership has been suspended.`);
      onSuccess();
    } catch {
      toast.error("Failed to suspend member. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-error/5 border border-error/20">
        <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary">Suspend {memberName}?</p>
          <p className="text-sm text-secondary mt-1">This will immediately restrict the member's access to the gym. This can be reversed.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Suspension</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. Outstanding balance, Code of conduct violation..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <LoadingButton type="submit" variant="destructive" className="flex-1" isLoading={isPending} loadingText="Suspending...">
              Suspend Member
            </LoadingButton>
          </div>
        </form>
      </Form>
    </div>
  );
}

// -- Activate Confirmation --
interface ActivateMemberProps {
  memberId: string;
  memberName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActivateMemberForm({ memberId, memberName, onSuccess, onCancel }: ActivateMemberProps) {
  const { mutateAsync, isPending } = useActivateMember(memberId);

  const handleActivate = async () => {
    try {
      await mutateAsync();
      toast.success(`${memberName}'s membership has been reactivated.`);
      onSuccess();
    } catch {
      toast.error("Failed to activate member.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Reactivate <span className="font-medium text-primary">{memberName}</span>'s membership and restore their gym access.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <LoadingButton className="flex-1 bg-success hover:bg-success/90" isLoading={isPending} loadingText="Activating..." onClick={handleActivate}>
          Activate Member
        </LoadingButton>
      </div>
    </div>
  );
}
