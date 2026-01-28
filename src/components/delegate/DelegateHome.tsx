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

  // Refresh completion status periodically
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
    {
      id: "speech",
      label: "Opening Speech",
      description: "Write and submit your opening speech",
      icon: Mic,
      complete: getTaskStatus('opening_speech'),
    },
    {
      id: "position-paper",
      label: "Position Paper",
      description: "Submit structured position paper with sources",
      icon: ScrollText,
      complete: getTaskStatus('position_paper'),
    },
    {
      id: "resolution",
      label: "Resolution / Amendment",
      description: "Draft resolution or propose amendments",
      icon: FileText,
      complete: getTaskStatus('resolution_amendment'),
    },
    {
      id: "procedural",
      label: "Procedural Participation",
      description: "Log motions, points, and votes",
      icon: Hand,
      complete: getTaskStatus('procedural_participation'),
    },
    {
      id: "quiz",
      label: "Rules Quiz",
      description: "Pass the MUN rules and procedures quiz",
      icon: HelpCircle,
      complete: getTaskStatus('rules_quiz'),
    },
    {
      id: "reflection",
      label: "Self-Reflection",
      description: "Complete mandatory post-conference reflection",
      icon: BookOpen,
      complete: getTaskStatus('self_reflection'),
    },
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
        <div className="diplomatic-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Welcome, Delegate</h1>
            <p className="text-muted-foreground mt-2">Set up your delegate profile to begin</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <Input
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="Enter your full name..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assigned Country</label>
              <Select value={setupCountry} onValueChange={setSetupCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country..." />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMITTEES.map(committee => (
                    <SelectItem key={committee} value={committee}>{committee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSetupProfile} className="w-full" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Begin Conference
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      {/* Welcome Card */}
      <div className="diplomatic-card p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
            <Flag className="w-10 h-10 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Representing
            </p>
            <h1 className="font-heading text-3xl font-bold mt-1">
              {profile?.country}
            </h1>
            <p className="text-muted-foreground mt-1">
              Committee: {profile?.committee} • {profile?.delegate_name}
            </p>
          </div>
        </div>
      </div>

      {/* Conference Completion Status */}
      {conferenceComplete && (
        <div className="diplomatic-card p-6 bg-success/10 border-success/50">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <div>
              <h2 className="font-heading text-xl font-semibold text-success">Conference Requirements Complete</h2>
              <p className="text-muted-foreground">Congratulations! You have completed all mandatory requirements.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="diplomatic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="subsection-heading">Conference Progress</h2>
          <span className="text-sm font-medium text-primary">
            {completedCount} of {tasks.length} requirements complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-muted-foreground">
            Complete all requirements to finish the conference
          </p>
          {!conferenceComplete && (
            <span className="text-xs text-warning flex items-center gap-1">
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
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={cn(
                  "diplomatic-card p-5 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer text-left w-full group",
                  task.complete ? "border-success/30 bg-success/5" : "hover:border-secondary/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  task.complete ? "bg-success/20" : "bg-secondary/10 group-hover:bg-secondary/20"
                )}>
                  <Icon className={cn("w-6 h-6", task.complete ? "text-success" : "text-secondary")} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{task.label}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                {task.complete ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Circle className="w-6 h-6 text-muted-foreground" />
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
