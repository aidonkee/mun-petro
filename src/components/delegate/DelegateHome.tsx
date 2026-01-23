import { Flag, Mic, FileText, HelpCircle, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { currentDelegate } from "@/data/mockData";
import { useSubmissions } from "@/hooks/useSubmissions";

interface DelegateHomeProps {
  onNavigate?: (view: string) => void;
}

export function DelegateHome({ onNavigate }: DelegateHomeProps) {
  const { submissions } = useSubmissions();

  // Check completion status from database
  const speechComplete = submissions.some(
    (s) => s.submission_type === "speech" && (s.status === "submitted" || s.status === "graded")
  );
  const resolutionComplete = submissions.some(
    (s) => s.submission_type === "resolution_draft" && (s.status === "submitted" || s.status === "graded")
  );
  // Quiz completion could be tracked separately, for now use mock
  const quizComplete = currentDelegate.progress.quizComplete;

  const completedCount = [speechComplete, resolutionComplete, quizComplete].filter(Boolean).length;
  const progressPercent = (completedCount / 3) * 100;

  const tasks = [
    {
      id: "speech",
      label: "Opening Speech",
      description: "Write your delegate opening speech in third person",
      icon: Mic,
      complete: speechComplete,
    },
    {
      id: "resolution",
      label: "Resolution Builder",
      description: "Draft your resolution with preambulatory and operative clauses",
      icon: FileText,
      complete: resolutionComplete,
    },
    {
      id: "quiz",
      label: "Rules Quiz",
      description: "Test your knowledge of MUN rules and procedures",
      icon: HelpCircle,
      complete: quizComplete,
    },
  ];

  const handleTaskClick = (taskId: string) => {
    if (onNavigate) {
      onNavigate(taskId);
    }
  };

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
              Assigned Country
            </p>
            <h1 className="font-heading text-3xl font-bold mt-1">
              {currentDelegate.country}
            </h1>
            <p className="text-muted-foreground mt-1">
              Committee: {currentDelegate.committee}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="diplomatic-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="subsection-heading">Your Progress</h2>
          <span className="text-sm font-medium text-primary">
            {completedCount} of 3 tasks complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <p className="text-sm text-muted-foreground mt-3">
          Complete all tasks to fully prepare for the conference
        </p>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        <h2 className="subsection-heading">Tasks</h2>
        <div className="grid gap-4">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="diplomatic-card p-5 flex items-center gap-5 hover:shadow-md transition-all hover:border-secondary/50 cursor-pointer text-left w-full group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{task.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
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
