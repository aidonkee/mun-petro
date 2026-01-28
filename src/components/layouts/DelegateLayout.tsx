import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LogOut,
  Hand,
  BookOpen,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";

interface DelegateLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "speech", label: "Speeches", icon: Mic },
  { id: "position-paper", label: "Position Paper", icon: ScrollText },
  { id: "resolution", label: "Resolution Builder", icon: FileText },
  { id: "procedural", label: "Procedural Actions", icon: Hand },
  { id: "quiz", label: "Rules Quiz", icon: HelpCircle },
  { id: "reflection", label: "Self-Reflection", icon: BookOpen },
];

export function DelegateLayout({
  children,
  activeView,
  onViewChange,
}: DelegateLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { profile } = useDelegateProfile();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const countryDisplay = profile?.country || "Delegate";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Delegate Theme (Blue & White) */}
      <aside
        className={cn(
          "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out sticky top-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Globe2 className="w-6 h-6 text-secondary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-heading text-base font-semibold text-foreground">
                  Delegate Portal
                </h1>
                <p className="text-xs text-muted-foreground">
                  {countryDisplay}
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
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full",
                  isActive
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="animate-fade-in truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full justify-center",
              "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
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
