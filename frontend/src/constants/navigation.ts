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
  LifeBuoy,
  ClipboardCheck,
  Bell,
  Mail,
  Share2,
  UserCheck,
  ClipboardList,
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
      { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
      { name: "Gyms", href: "/super-admin/gyms", icon: Building2 },
      { name: "Subscription Plans", href: "/super-admin/plans", icon: CreditCard },
      { name: "Revenue", href: "/super-admin/revenue", icon: Activity },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Broadcast", href: "/super-admin/broadcast", icon: Megaphone },
      { name: "Support", href: "/super-admin/support", icon: LifeBuoy },
      { name: "Settings", href: "/super-admin/settings", icon: Settings },
    ],
  },
];

export const OWNER_NAVIGATION: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Members", href: "/admin/members", icon: Users },
      { name: "Membership Plans", href: "/admin/plans", icon: FileText },
      { name: "Member Payments", href: "/admin/member-payments", icon: CreditCard },
    ],
  },
  {
    title: "Gym Activity",
    items: [
      { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
      { name: "Workouts", href: "/admin/workouts", icon: Dumbbell },
      { name: "Workout Assignments", href: "/admin/workout-assignments", icon: Share2 },
      { name: "Exercises", href: "/admin/exercises", icon: Activity },
      { name: "QR Entry", href: "/admin/qr", icon: QrCode },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Reports", href: "/admin/reports", icon: FileText },
      { name: "Branding", href: "/admin/branding", icon: Palette },
      { name: "Staff", href: "/admin/staff", icon: Users },
      { name: "Trainers", href: "/admin/trainers", icon: UserCheck },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Broadcasts", href: "/admin/broadcasts", icon: Megaphone },
      { name: "Message Templates", href: "/admin/message-templates", icon: Mail },
      { name: "Notifications", href: "/admin/notifications", icon: Bell },
    ],
  },
];

export const TRAINER_NAVIGATION: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Members",
    items: [
      { name: "My Members", href: "/admin/my-members", icon: Users },
    ],
  },
  {
    title: "Training",
    items: [
      { name: "My Workout Plans", href: "/admin/my-workout-plans", icon: Dumbbell },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "My Profile", href: "/admin/profile", icon: Settings },
    ],
  },
];

export const MEMBER_NAVIGATION: NavGroup[] = [
  {
    title: "My Gym",
    items: [
      { name: "Dashboard", href: "/member", icon: LayoutDashboard },
      { name: "My Membership", href: "/member/membership", icon: FileText },
      { name: "Workout Plan", href: "/member/workout-plan", icon: Dumbbell },
    ],
  },
  {
    title: "Access & Billing",
    items: [
      { name: "Attendance", href: "/member/attendance", icon: ClipboardCheck },
      { name: "QR Pass", href: "/member/qr", icon: QrCode },
      { name: "Payment History", href: "/member/member-payments", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/member/profile", icon: Users },
      { name: "Settings", href: "/member/settings", icon: Settings },
    ],
  },
];
