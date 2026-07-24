/**
 * Utility functions for Member Portal formatting.
 */

export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours < 12) return "Good Morning";
  if (hours < 17) return "Good Afternoon";
  return "Good Evening";
}

export function formatDisplayDate(date: Date = new Date()): string {
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  return `${dayName}, ${dayNum} ${monthName}`;
}

export function formatShortDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function formatRestTime(restInput?: number | string | null): string {
  if (restInput === undefined || restInput === null || restInput === "") return "";
  const num = typeof restInput === "number" ? restInput : parseInt(String(restInput), 10);
  if (isNaN(num) || num <= 0) return "";
  if (num < 60) return `${num}s`;
  const mins = Math.floor(num / 60);
  const secs = num % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
}
