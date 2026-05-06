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
  Rocket,
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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-violet-500 to-purple-600" },
  { id: "speech", label: "Speeches", icon: Mic, color: "from-pink-500 to-rose-600" },
  { id: "position-paper", label: "Position Paper", icon: ScrollText, color: "from-cyan-500 to-blue-600" },
  { id: "resolution", label: "Resolution Builder", icon: FileText, color: "from-amber-500 to-orange-600" },
  { id: "procedural", label: "Procedural Actions", icon: Hand, color: "from-teal-500 to-emerald-600" },
  { id: "quiz", label: "Rules Quiz", icon: HelpCircle, color: "from-indigo-500 to-violet-600" },
  { id: "reflection", label: "Self-Reflection", icon: BookOpen, color: "from-rose-500 to-pink-600" },
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
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen flex flex-col transition-all duration-300 ease-in-out sticky top-0",
          "bg-gradient-to-b from-[hsl(252,40%,16%)] to-[hsl(230,30%,12%)]",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-heading text-base font-semibold text-white">
                  Delegate Portal
                </h1>
                <p className="text-xs text-white/50">
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
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full group",
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                  isActive
                    ? `bg-gradient-to-br ${item.color} shadow-md`
                    : "bg-white/10 group-hover:bg-white/15"
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
        <div className="p-3 border-t border-white/10 space-y-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-white/50 hover:text-white hover:bg-white/10",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </Button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full justify-center",
              "text-white/50 hover:bg-white/5 hover:text-white/80"
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
      <main className="flex-1 overflow-auto relative">
        {/* Vibrant decorative background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background:
              "radial-gradient(900px circle at 0% 0%, hsl(252 85% 60% / 0.12), transparent 55%)," +
              "radial-gradient(700px circle at 100% 10%, hsl(199 89% 48% / 0.12), transparent 55%)," +
              "radial-gradient(800px circle at 80% 100%, hsl(330 80% 60% / 0.12), transparent 55%)," +
              "radial-gradient(600px circle at 10% 90%, hsl(38 92% 55% / 0.10), transparent 55%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div className="relative z-10 p-8">{children}</div>
      </main>
    </div>
  );
}
