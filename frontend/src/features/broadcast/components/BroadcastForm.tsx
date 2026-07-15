import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBroadcastSchema, CreateBroadcastData } from "../schemas/broadcast.schema";
import { BROADCAST_CHANNEL_LABELS, RECIPIENT_TARGET_LABELS, BroadcastChannel, RecipientTarget } from "../types";
import { useMessageTemplates } from "@/features/messageTemplates/hooks/useMessageTemplates";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BroadcastFormProps {
  defaultValues?: Partial<CreateBroadcastData>;
  onSubmit: (data: CreateBroadcastData) => void;
  isSubmitting?: boolean;
  editMode?: boolean;
}

export function BroadcastForm({ defaultValues, onSubmit, isSubmitting, editMode }: BroadcastFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBroadcastData>({
    resolver: zodResolver(createBroadcastSchema),
    defaultValues: {
      title: "",
      channel: "whatsapp" as BroadcastChannel,
      message: "",
      messageTemplateId: "",
      recipientCriteria: { target: "all" as RecipientTarget, selectedMemberIds: [] },
      scheduledAt: "",
      ...defaultValues,
    },
  });

  const channel = watch("channel");
  const recipientTarget = watch("recipientCriteria.target");
  const { data: templatesData } = useMessageTemplates({ limit: 100 });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Title *</Label>
        <Input placeholder="e.g. March Payment Reminder" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Channel *</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(BROADCAST_CHANNEL_LABELS) as [BroadcastChannel, string][]).map(([k, v]) => (
            <div
              key={k}
              className={`border rounded-lg p-3 cursor-pointer text-center transition-all ${
                channel === k ? "border-primary bg-primary/5" : "border-default hover:border-hover"
              }`}
              onClick={() => setValue("channel", k)}
            >
              <span className="text-xs font-semibold text-primary">{v}</span>
            </div>
          ))}
        </div>
        {errors.channel && <p className="text-xs text-destructive mt-1">{errors.channel.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Message Template (Optional)</Label>
        <select
          value={watch("messageTemplateId") || ""}
          onChange={(e) => setValue("messageTemplateId", e.target.value || undefined)}
          className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
        >
          <option value="">No template — use custom message</option>
          {(templatesData?.data || []).filter(t => t.active).map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">
          Custom Message {!watch("messageTemplateId") ? "*" : ""}
        </Label>
        <Textarea
          placeholder="Write your message. Use {{name}} for member name."
          className="min-h-[100px] resize-y"
          {...register("message")}
          disabled={!!watch("messageTemplateId")}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Audience *</Label>
        <select
          value={recipientTarget}
          onChange={(e) => setValue("recipientCriteria.target", e.target.value as RecipientTarget)}
          className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
        >
          {(Object.entries(RECIPIENT_TARGET_LABELS) as [RecipientTarget, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {errors.recipientCriteria?.target && (
          <p className="text-xs text-destructive mt-1">{errors.recipientCriteria.target.message}</p>
        )}
      </div>

      {recipientTarget === "selected" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Selected Member IDs</Label>
          <Input
            placeholder="Comma-separated member IDs"
            onChange={(e) => setValue("recipientCriteria.selectedMemberIds", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
          />
          <p className="text-[10px] text-muted">Enter member IDs separated by commas.</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Schedule (Optional)</Label>
        <Input type="datetime-local" {...register("scheduledAt")} />
        <p className="text-[10px] text-muted">Leave empty to save as draft. Set a future date to schedule.</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-default">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isSubmitting}>
          {editMode ? "Update Broadcast" : "Create Broadcast"}
        </LoadingButton>
      </div>
    </form>
  );
}
