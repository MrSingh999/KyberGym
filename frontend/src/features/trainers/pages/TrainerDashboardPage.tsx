import { motion } from "framer-motion";
import { Users, UserCircle, Calendar } from "lucide-react";
import { useMyProfile, useMyMembers } from "../hooks/useTrainers";

export function TrainerDashboardPage() {
  const { data: profile } = useMyProfile();
  const { data: members } = useMyMembers({ page: 1, limit: 1 });
  const memberCount = members?.total ?? 0;

  const cards = [
    {
      label: "Assigned Members",
      value: memberCount,
      icon: Users,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Status",
      value: profile?.status === "ACTIVE" ? "Active" : "Inactive",
      icon: UserCircle,
      color: profile?.status === "ACTIVE" ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Joined",
      value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : "—",
      icon: Calendar,
      color: "text-text-muted bg-surface-hover",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-bold text-xl sm:text-2xl text-text-primary tracking-tight">
          Welcome back{profile ? `, ${profile.fullName?.split(" ")[0]}` : ""}
        </h1>
        <p className="text-text-secondary mt-1 text-xs font-mono">Trainer dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface border border-border-default rounded-[12px] p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-mono">{card.label}</p>
              <p className="text-lg font-bold text-text-primary tracking-tight">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {profile?.specialization && (
        <div className="bg-surface border border-border-default rounded-[12px] p-4">
          <p className="text-xs text-text-muted font-mono mb-1">Specialization</p>
          <p className="text-sm text-text-primary font-mono">{profile.specialization}</p>
        </div>
      )}
    </div>
  );
}
