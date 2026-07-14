import React from "react";
import { format, parseISO } from "date-fns";
import { Mail, Phone, Calendar, Droplets, MapPin, Dumbbell } from "lucide-react";
import { WidgetContainer } from "../../dashboard/widgets/WidgetContainer";
import { WidgetHeader } from "../../dashboard/widgets/WidgetHeader";
import { WidgetBody } from "../../dashboard/widgets/WidgetBody";
import { MemberProfile } from "../types/profile";

interface MemberOverviewCardProps {
  member?: MemberProfile;
  isLoading: boolean;
}

interface DetailRowProps { icon: React.ReactNode; label: string; value?: string }

function DetailRow({ icon, label, value }: DetailRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-subtle last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-muted">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-muted font-medium">{label}</span>
        <span className="text-sm text-primary font-medium truncate">{value}</span>
      </div>
    </div>
  );
}

export function MemberOverviewCard({ member, isLoading }: MemberOverviewCardProps) {
  return (
    <WidgetContainer>
      <WidgetHeader title="Personal Info" />
      <WidgetBody isLoading={isLoading}>
        {member && (
          <div className="divide-y divide-subtle -mt-2">
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={member.email} />
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={member.phone} />
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={member.dateOfBirth ? format(parseISO(member.dateOfBirth), "MMM d, yyyy") : undefined} />
            <DetailRow icon={<Droplets className="h-4 w-4" />} label="Blood Group" value={member.bloodGroup} />
            <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={member.address} />
            <DetailRow icon={<Dumbbell className="h-4 w-4" />} label="Trainer" value={member.assignedTrainerName} />
          </div>
        )}
      </WidgetBody>
    </WidgetContainer>
  );
}
