import { useMemberHomeContext } from "../../context/useMemberHomeContext";
import { AnnouncementSectionView, FormattedAnnouncement } from "./AnnouncementSectionView";
import { formatShortDate } from "../../utils/formatters";

export function AnnouncementSectionContainer() {
  const { homeData, isLoading } = useMemberHomeContext();
  const items = homeData?.announcements || [];

  const formattedAnnouncements: FormattedAnnouncement[] = items.map((item, index) => {
    const id = (item._id as string) || String(index);
    const title = (item.title || item.subject || item.message || "Announcement") as string;
    const content = (item.content || item.body || "") as string;
    const formattedDate = item.createdAt ? formatShortDate(item.createdAt as string) : "";

    return { id, title, content, formattedDate };
  });

  return (
    <AnnouncementSectionView
      announcements={formattedAnnouncements}
      isLoading={isLoading}
    />
  );
}
