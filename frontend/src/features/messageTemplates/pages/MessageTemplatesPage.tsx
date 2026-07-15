import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useMessageTemplates, useDeleteMessageTemplate } from "../hooks/useMessageTemplates";
import { TEMPLATE_TYPE_LABELS, TEMPLATE_CHANNEL_LABELS, TemplateType, TemplateChannel } from "../types";
import { Skeleton } from "@/components/feedback/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export function MessageTemplatesPage() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (typeFilter) filters.type = typeFilter;
  if (channelFilter) filters.channel = channelFilter;

  const { data, isLoading, isError, refetch } = useMessageTemplates({ filters: filters as any });
  const { mutate: deleteTemplate } = useDeleteMessageTemplate();

  const templates = data?.data ?? [];

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteTemplate(deleteConfirm, {
      onSuccess: () => {
        toast.success("Template deleted");
        setDeleteConfirm(null);
      },
      onError: () => {
        toast.error("Failed to delete template");
        setDeleteConfirm(null);
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl text-primary tracking-tight">
            Message <span className="text-secondary font-normal ml-0.5">Templates</span>
          </h1>
          <p className="text-muted mt-1 text-xs">Reusable message templates for broadcasts.</p>
        </div>
        <button
          onClick={() => navigate("/admin/message-templates/new")}
          className="flex items-center space-x-2 bg-primary text-primary-foreground hover:opacity-90 px-4 py-2.5 sm:py-2 rounded-lg font-semibold text-sm transition-all min-h-[44px] w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-default bg-surface px-3 text-sm text-primary min-w-[140px]"
        >
          <option value="">All Types</option>
          {(Object.entries(TEMPLATE_TYPE_LABELS) as [string, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="h-10 rounded-lg border border-default bg-surface px-3 text-sm text-primary min-w-[120px]"
        >
          <option value="">All Channels</option>
          {(Object.entries(TEMPLATE_CHANNEL_LABELS) as [string, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Failed to load templates" message="Could not fetch message templates." onRetry={() => refetch()} />
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface-hover border border-default rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-muted" />
          </div>
          <h3 className="font-semibold text-lg text-primary mb-2">No Templates Yet</h3>
          <p className="text-sm text-muted max-w-xs mx-auto mb-4">
            Create your first message template for broadcasts.
          </p>
          <Button onClick={() => navigate("/admin/message-templates/new")}>Create Template</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-default bg-surface p-4 hover:border-hover transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/message-templates/${t.id}/edit`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-primary truncate">{t.name}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                      {TEMPLATE_TYPE_LABELS[t.type]}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-hover text-muted border border-default uppercase tracking-wider">
                      {TEMPLATE_CHANNEL_LABELS[t.channel]}
                    </span>
                    {!t.active && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{t.content}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(t.id); }}
                  className="p-2 text-muted hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ResponsiveModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Delete Template?</h3>
          <p className="text-sm text-muted mb-6">This action cannot be undone. Broadcasts using this template will still work.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
