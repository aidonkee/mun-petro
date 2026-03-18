import { useEffect, useState } from "react";
import {
  Flag,
  Mic,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  ChevronRight,
  ScrollText,
  Hand,
  BookOpen,
  AlertTriangle,
  Loader2,
  Rocket,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDelegateProfile, CompletionStatus } from "@/hooks/useDelegateProfile";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DelegateHomeProps {
  onNavigate?: (view: string) => void;
}

const COMMITTEES = [
  "General Assembly",
  "Security Council (UNSC)",
  "ECOSOC",
  "Human Rights Council",
  "DISEC",
  "WHO",
  "UNICEF",
];

const COUNTRIES = [
  "United States", "United Kingdom", "France", "Germany", "China", "Russia",
  "Japan", "Brazil", "India", "South Africa", "Australia", "Canada",
  "Mexico", "Argentina", "Egypt", "Nigeria", "Kenya", "South Korea",
  "Indonesia", "Saudi Arabia", "Turkey", "Italy", "Spain", "Netherlands",
];

const taskColors = [
  { gradient: "from-pink-500 to-rose-600", bg: "bg-pink-500/10", text: "text-pink-600" },
  { gradient: "from-cyan-500 to-blue-600", bg: "bg-cyan-500/10", text: "text-cyan-600" },
  { gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", text: "text-amber-600" },
  { gradient: "from-teal-500 to-emerald-600", bg: "bg-teal-500/10", text: "text-teal-600" },
  { gradient: "from-indigo-500 to-violet-600", bg: "bg-indigo-500/10", text: "text-indigo-600" },
  { gradient: "from-rose-500 to-pink-600", bg: "bg-rose-500/10", text: "text-rose-600" },
];

export function DelegateHome({ onNavigate }: DelegateHomeProps) {
  const { 
    profile, 
    completionStatus, 
    loading, 
    createProfile, 
    getCompletionPercentage, 
    isConferenceComplete,
    fetchCompletionStatus,
  } = useDelegateProfile();
  
  const [showSetup, setShowSetup] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupCountry, setSetupCountry] = useState('');
  const [setupCommittee, setSetupCommittee] = useState('General Assembly');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      setShowSetup(true);
    }
  }, [loading, profile]);

  useEffect(() => {
    if (profile) {
      fetchCompletionStatus();
    }
  }, [profile, fetchCompletionStatus]);

  const handleSetupProfile = async () => {
    if (!setupName.trim() || !setupCountry) {
      toast({ title: "Complete Setup", description: "Please enter your name and select a country", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await createProfile(setupName.trim(), setupCountry, setupCommittee);
      setShowSetup(false);
      toast({ title: "Profile Created", description: "Welcome to the conference!" });
    } catch {
      toast({ title: "Error", description: "Failed to create profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getTaskStatus = (key: keyof CompletionStatus): boolean => {
    return completionStatus?.[key] ?? false;
  };

  const tasks = [
    { id: "speech", label: "Opening Speech", description: "Write and submit your opening speech", icon: Mic, complete: getTaskStatus('opening_speech') },
    { id: "position-paper", label: "Position Paper", description: "Submit structured position paper with sources", icon: ScrollText, complete: getTaskStatus('position_paper') },
    { id: "resolution", label: "Resolution / Amendment", description: "Draft resolution or propose amendments", icon: FileText, complete: getTaskStatus('resolution_amendment') },
    { id: "procedural", label: "Procedural Participation", description: "Log motions, points, and votes", icon: Hand, complete: getTaskStatus('procedural_participation') },
    { id: "quiz", label: "Rules Quiz", description: "Pass the MUN rules and procedures quiz", icon: HelpCircle, complete: getTaskStatus('rules_quiz') },
    { id: "reflection", label: "Self-Reflection", description: "Complete mandatory post-conference reflection", icon: BookOpen, complete: getTaskStatus('self_reflection') },
  ];

  const completedCount = tasks.filter(t => t.complete).length;
  const progressPercent = getCompletionPercentage();
  const conferenceComplete = isConferenceComplete();

  const handleTaskClick = (taskId: string) => {
    if (onNavigate) {
      onNavigate(taskId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Profile Setup
  if (showSetup) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto mt-12">
        <div className="diplomatic-card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[hsl(252,85%,60%)] via-[hsl(330,80%,60%)] to-[hsl(199,89%,48%)]" />
          <div className="text-center mb-8 mt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Welcome, Delegate</h1>
            <p className="text-muted-foreground mt-2">Set up your delegate profile to begin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <Input value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Enter your full name..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned Country</label>
              <Select value={setupCountry} onValueChange={setSetupCountry}>
                <SelectTrigger><SelectValue placeholder="Select your country..." /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Committee</label>
              <Select value={setupCommittee} onValueChange={setSetupCommittee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMMITTEES.map(committee => (
                    <SelectItem key={committee} value={committee}>{committee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSetupProfile} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              🚀 Begin Conference
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      {/* Welcome Card with gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(199,89%,48%)] via-[hsl(220,70%,50%)] to-[hsl(252,85%,60%)] p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Flag className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-sm text-white/70 uppercase tracking-wide font-medium">
              Representing
            </p>
            <h1 className="font-heading text-3xl font-bold mt-1">
              {profile?.country}
            </h1>
            <p className="text-white/70 mt-1">
              Committee: {profile?.committee} • {profile?.delegate_name}
            </p>
          </div>
        </div>
      </div>

      {/* Conference Completion Status */}
      {conferenceComplete && (
        <div className="rounded-2xl bg-gradient-to-r from-[hsl(152,69%,45%)] to-[hsl(172,66%,50%)] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">Conference Requirements Complete! 🎉</h2>
              <p className="text-white/80">Congratulations! You have completed all mandatory requirements.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="diplomatic-card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="subsection-heading">Conference Progress</h2>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
            {completedCount}/{tasks.length} complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-muted-foreground">
            Complete all requirements to finish the conference
          </p>
          {!conferenceComplete && (
            <span className="text-xs text-warning flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" />
              {tasks.length - completedCount} remaining
            </span>
          )}
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        <h2 className="subsection-heading">Requirements Checklist</h2>
        <div className="grid gap-3">
          {tasks.map((task, idx) => {
            const Icon = task.icon;
            const color = taskColors[idx];
            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={cn(
                  "diplomatic-card p-5 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer text-left w-full group",
                  task.complete && "border-success/30"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                  task.complete
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md"
                    : `bg-gradient-to-br ${color.gradient} shadow-md opacity-80 group-hover:opacity-100`
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{task.label}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                {task.complete ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                ) : (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Circle className="w-6 h-6 text-muted-foreground/40" />
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
