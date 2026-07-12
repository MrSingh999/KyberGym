import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  Settings,
  Activity,
  QrCode,
  FileText,
  Palette,
  Building2,
  Megaphone,
  LifeBuoy
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const SUPERADMIN_NAVIGATION: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Gyms", href: "/admin/gyms", icon: Building2 },
      { name: "Subscription Plans", href: "/admin/plans", icon: CreditCard },
      { name: "Revenue", href: "/admin/revenue", icon: Activity },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Broadcast", href: "/admin/broadcast", icon: Megaphone },
      { name: "Support", href: "/admin/support", icon: LifeBuoy },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const OWNER_NAVIGATION: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Members", href: "/dashboard/members", icon: Users },
      { name: "Membership Plans", href: "/dashboard/plans", icon: FileText },
      { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    title: "Gym Activity",
    items: [
      { name: "Workouts", href: "/dashboard/workouts", icon: Dumbbell },
      { name: "Exercises", href: "/dashboard/exercises", icon: Activity },
      { name: "QR Entry", href: "/dashboard/qr", icon: QrCode },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
      { name: "Branding", href: "/dashboard/branding", icon: Palette },
      { name: "Staff", href: "/dashboard/staff", icon: Users },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export const MEMBER_NAVIGATION: NavGroup[] = [
  {
    title: "My Gym",
    items: [
      { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
      { name: "My Membership", href: "/portal/membership", icon: FileText },
      { name: "Workout Plan", href: "/portal/workout-plan", icon: Dumbbell },
    ],
  },
  {
    title: "Access & Billing",
    items: [
      { name: "QR Pass", href: "/portal/qr", icon: QrCode },
      { name: "Payment History", href: "/portal/payments", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/portal/profile", icon: Users },
      { name: "Settings", href: "/portal/settings", icon: Settings },
    ],
  },
];
