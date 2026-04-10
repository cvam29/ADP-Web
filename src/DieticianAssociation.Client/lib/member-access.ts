import {
  Award,
  Briefcase,
  FileText,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  Search,
  User,
  Users,
  Calendar,
} from "lucide-react";

export type MemberNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  requiredPermission?: string;
};

export const adminDashboardPermission = "admin.dashboard.view";

export const memberMainNav: MemberNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true, requiredPermission: "member.dashboard.access" },
  { label: "My Events", href: "/dashboard/events", icon: Calendar },
  { label: "My Articles", href: "/dashboard/articles", icon: FileText, requiredPermission: "member.blogs.write" },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award, requiredPermission: "member.certificates.access" },
  { label: "Discover", href: "/dashboard/discover", icon: Search },
  { label: "Profile", href: "/profile", icon: User },
];

export const memberResourceNav: MemberNavItem[] = [
  { label: "Professional Tools", href: "/dashboard/tools", icon: LayoutGrid, requiredPermission: "member.tools.access" },
  { label: "Member Directory", href: "/dashboard/directory", icon: Users, requiredPermission: "member.directory.access" },
  { label: "Continuing Education", href: "/dashboard/education", icon: GraduationCap },
  { label: "Career Center", href: "/dashboard/career", icon: Briefcase, requiredPermission: "member.career.access" },
  { label: "Research Library", href: "/dashboard/research", icon: FlaskConical, requiredPermission: "member.research.access" },
];