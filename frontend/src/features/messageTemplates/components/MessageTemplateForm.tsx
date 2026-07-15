import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageTemplateSchema, CreateMessageTemplateData } from "../schemas/messageTemplate.schema";
import { TEMPLATE_TYPE_LABELS, TEMPLATE_CHANNEL_LABELS, TemplateType, TemplateChannel } from "../types";
import { Button, LoadingButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MessageTemplateFormProps {
  defaultValues?: Partial<CreateMessageTemplateData>;
  onSubmit: (data: CreateMessageTemplateData) => void;
  isSubmitting?: boolean;
  editMode?: boolean;
}

export function MessageTemplateForm({ defaultValues, onSubmit, isSubmitting, editMode }: MessageTemplateFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMessageTemplateData>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      name: "",
      type: "custom" as TemplateType,
      channel: "whatsapp" as TemplateChannel,
      subject: "",
      content: "",
      variables: [],
      ...defaultValues,
    },
  });

  const channel = watch("channel");
  const type = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Template Name *</Label>
        <Input placeholder="e.g. Payment Reminder" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Type *</Label>
          <select
            value={type}
            onChange={(e) => setValue("type", e.target.value as TemplateType)}
            disabled={editMode}
            className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary disabled:opacity-50"
          >
            {(Object.entries(TEMPLATE_TYPE_LABELS) as [TemplateType, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Channel *</Label>
          <select
            value={channel}
            onChange={(e) => setValue("channel", e.target.value as TemplateChannel)}
            disabled={editMode}
            className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary disabled:opacity-50"
          >
            {(Object.entries(TEMPLATE_CHANNEL_LABELS) as [TemplateChannel, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {errors.channel && <p className="text-xs text-destructive mt-1">{errors.channel.message}</p>}
        </div>
      </div>

      {channel === "email" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Email Subject</Label>
          <Input placeholder="e.g. Your membership is expiring soon" {...register("subject")} />
          {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted font-bold uppercase tracking-wider">Content *</Label>
        <Textarea
          placeholder="Write your message template content here. Use {{name}} for member name."
          className="min-h-[160px] resize-y"
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-destructive mt-1">{errors.content.message}</p>}
        <p className="text-[10px] text-muted mt-1">
          Available variables: <code className="bg-surface-hover px-1 rounded text-[10px]">{`{{name}}`}</code>
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-default">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isSubmitting}>
          {editMode ? "Update Template" : "Create Template"}
        </LoadingButton>
      </div>
    </form>
  );
}
