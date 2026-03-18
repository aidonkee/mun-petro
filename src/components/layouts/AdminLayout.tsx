import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LogOut,
  Award,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "from-violet-500 to-purple-600" },
  { id: "students", label: "Student Management", icon: Users, color: "from-cyan-500 to-blue-600" },
  { id: "grading", label: "Grading", icon: ClipboardCheck, color: "from-pink-500 to-rose-600" },
  { id: "assessment", label: "Assessment Dashboard", icon: Award, color: "from-amber-500 to-orange-600" },
  { id: "gppr", label: "GPPR Assessment", icon: GraduationCap, color: "from-teal-500 to-emerald-600" },
  { id: "quiz-settings", label: "Quiz Settings", icon: Settings, color: "from-slate-400 to-slate-600" },
];

export function AdminLayout({
  children,
  activeView,
  onViewChange,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-heading text-base font-semibold text-sidebar-foreground">
                  Admin Portal
                </h1>
                <p className="text-xs text-sidebar-foreground/50">
                  Teacher Dashboard
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "nav-item w-full group",
                  isActive && "bg-sidebar-primary/20 text-sidebar-primary font-medium"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isActive
                    ? `bg-gradient-to-br ${item.color} shadow-md`
                    : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                )}>
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "")} />
                </div>
                {!collapsed && (
                  <span className="animate-fade-in truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="animate-fade-in">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
