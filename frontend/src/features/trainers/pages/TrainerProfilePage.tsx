import { motion } from "framer-motion";
import { Mail, Phone, BookOpen, Calendar, UserCircle, Dumbbell, Users } from "lucide-react";
import { useMyProfile } from "../hooks/useTrainers";
import { Skeleton } from "@/components/feedback/Skeleton";

export function TrainerProfilePage() {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-[12px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto">
        <p className="text-text-muted font-mono text-sm">Profile not found.</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Members",
      value: profile.memberCount ?? 0,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Status",
      value: profile.status === "ACTIVE" ? "Active" : "Inactive",
      icon: UserCircle,
      color: profile.status === "ACTIVE" ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Joined",
      value: new Date(profile.joiningDate).toLocaleDateString(),
      icon: Calendar,
      color: "text-text-muted bg-surface-hover",
    },
  ];

  const details = [
    { label: "Email", value: profile.email, icon: Mail },
    { label: "Phone", value: profile.phone || "—", icon: Phone },
    { label: "Specialization", value: profile.specialization || "—", icon: BookOpen },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-2xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface border border-border-default rounded-[12px] p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-mono">{s.label}</p>
              <p className="text-lg font-bold text-text-primary tracking-tight">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border-default rounded-[16px] p-6 space-y-6"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-border-default">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{profile.fullName}</h2>
            <p className="text-xs text-text-muted font-mono">Trainer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover/50">
              <d.icon className="w-4 h-4 text-text-muted shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">{d.label}</p>
                <p className="text-sm text-text-primary font-mono truncate">{d.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
