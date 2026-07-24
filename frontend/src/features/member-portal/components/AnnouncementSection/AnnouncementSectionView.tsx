import { AnnouncementSkeleton } from "../common/Skeletons";
import { Bell } from "lucide-react";

export interface FormattedAnnouncement {
  id: string;
  title: string;
  content: string;
  formattedDate: string;
}

interface AnnouncementSectionViewProps {
  announcements: FormattedAnnouncement[];
  isLoading: boolean;
}

export function AnnouncementSectionView({ announcements, isLoading }: AnnouncementSectionViewProps) {
  if (isLoading) {
    return <AnnouncementSkeleton />;
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border-default bg-background-paper mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-text-secondary" />
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Announcements
        </h2>
      </div>

      {announcements.length === 0 ? (
        <div className="border-t border-border-default/60 pt-3">
          <p className="text-sm font-medium text-text-muted">
            No announcements yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-default/60 border-t border-border-default/60">
          {announcements.map((item) => (
            <div key={item.id} className="py-3 first:pt-3 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  {item.title}
                </h3>
                {item.formattedDate && (
                  <span className="text-[11px] text-text-muted shrink-0">
                    {item.formattedDate}
                  </span>
                )}
              </div>
              {item.content && (
                <p className="text-xs text-text-secondary mt-1 leading-relaxed line-clamp-2">
                  {item.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
