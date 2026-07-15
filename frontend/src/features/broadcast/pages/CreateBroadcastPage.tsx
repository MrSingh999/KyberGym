import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useCreateBroadcast } from "../hooks/useBroadcasts";
import { BroadcastForm } from "../components/BroadcastForm";
import { CreateBroadcastData } from "../schemas/broadcast.schema";

export function CreateBroadcastPage() {
  const navigate = useNavigate();
  const { mutate: createBroadcast, isPending } = useCreateBroadcast();

  const handleSubmit = (data: CreateBroadcastData) => {
    createBroadcast(data, {
      onSuccess: (res) => {
        toast.success("Broadcast created");
        navigate(`/admin/broadcasts/${res.id || res._id}`);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to create broadcast");
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/broadcasts")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Broadcasts
      </button>

      <div className="rounded-xl border border-hover bg-surface p-5 sm:p-6 space-y-4">
        <div className="border-b border-default/40 pb-3">
          <h2 className="font-bold text-base text-primary">New Broadcast</h2>
          <p className="text-xs text-muted mt-1">Create a bulk message to send to your members.</p>
        </div>
        <BroadcastForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  );
}
