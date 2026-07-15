import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useCreateMessageTemplate } from "../hooks/useMessageTemplates";
import { MessageTemplateForm } from "../components/MessageTemplateForm";
import { CreateMessageTemplateData } from "../schemas/messageTemplate.schema";

export function CreateMessageTemplatePage() {
  const navigate = useNavigate();
  const { mutate: createTemplate, isPending } = useCreateMessageTemplate();

  const handleSubmit = (data: CreateMessageTemplateData) => {
    createTemplate(data, {
      onSuccess: (res) => {
        toast.success("Template created");
        navigate("/admin/message-templates");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create template");
      },
    });
  };

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
          <h2 className="font-bold text-base text-primary">New Message Template</h2>
          <p className="text-xs text-muted mt-1">
            Create a reusable template for WhatsApp, Email, or In-App messages.
          </p>
        </div>
        <MessageTemplateForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  );
}
