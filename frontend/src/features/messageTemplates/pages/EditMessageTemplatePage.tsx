import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useMessageTemplate, useUpdateMessageTemplate } from "../hooks/useMessageTemplates";
import { MessageTemplateForm } from "../components/MessageTemplateForm";
import { CreateMessageTemplateData } from "../schemas/messageTemplate.schema";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";

export function EditMessageTemplatePage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { data: template, isLoading, isError } = useMessageTemplate(templateId!);
  const { mutate: updateTemplate, isPending } = useUpdateMessageTemplate(templateId!);

  const handleSubmit = (data: CreateMessageTemplateData) => {
    updateTemplate(data, {
      onSuccess: () => {
        toast.success("Template updated");
        navigate("/admin/message-templates");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to update template");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <ErrorState title="Template not found" message="Could not load this template for editing." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/message-templates")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Templates
      </button>

      <div className="rounded-xl border border-hover bg-surface p-5 sm:p-6 space-y-4">
        <div className="border-b border-default/40 pb-3">
          <h2 className="font-bold text-base text-primary">Edit Template</h2>
          <p className="text-xs text-muted mt-1">Update the message template details.</p>
        </div>
        <MessageTemplateForm
          defaultValues={{
            name: template.name,
            type: template.type,
            channel: template.channel,
            subject: template.subject,
            content: template.content,
            variables: template.variables,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          editMode
        />
      </div>
    </div>
  );
}
