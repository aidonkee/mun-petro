import { Users, FileCheck, Award, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statStyles = [
  { cardClass: "stat-card-violet", iconClass: "icon-box-violet" },
  { cardClass: "stat-card-cyan", iconClass: "icon-box-cyan" },
  { cardClass: "stat-card-pink", iconClass: "icon-box-pink" },
  { cardClass: "stat-card-amber", iconClass: "icon-box-amber" },
];

export function AdminOverview() {
  const { data: delegates = [], isLoading: delegatesLoading } = useQuery({
    queryKey: ["admin-delegates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delegate_profiles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: quizResults = [], isLoading: quizLoading } = useQuery({
    queryKey: ["admin-quiz-results"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quiz_results").select("*");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = delegatesLoading || submissionsLoading || quizLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalDelegates = delegates.length;
  const activeDelegates = delegates.filter(d => !d.conference_completed).length;
  const pendingSubmissions = submissions.filter(s => s.status === "submitted").length;
  const gradedSubmissions = submissions.filter(s => s.status === "graded");
  
  const avgScore = gradedSubmissions.length > 0
    ? (gradedSubmissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedSubmissions.length).toFixed(1)
    : "N/A";

  const quizCompletion = totalDelegates > 0
    ? Math.round((quizResults.length / totalDelegates) * 100)
    : 0;

  const stats = [
    { label: "Total Delegates", value: totalDelegates.toString(), change: `${activeDelegates} active`, icon: Users },
    { label: "Submissions", value: submissions.length.toString(), change: `${pendingSubmissions} pending`, icon: FileCheck },
    { label: "Avg. Score", value: avgScore, icon: Award },
    { label: "Quiz Completion", value: `${quizCompletion}%`, icon: TrendingUp },
  ];

  const recentSubmissions = submissions.slice(0, 4);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with gradient banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(252,85%,60%)] via-[hsl(280,70%,55%)] to-[hsl(330,80%,60%)] p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="font-heading text-2xl font-bold">Overview</h2>
          </div>
          <p className="text-white/70">Monitor delegate progress, submissions, and quiz results</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const style = statStyles[i];
          return (
            <div key={stat.label} className={style.cardClass}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold font-heading mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-primary mt-1 font-medium">{stat.change}</p>
                  )}
                </div>
                <div className={style.iconClass}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-5 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
          <h3 className="subsection-heading">Recent Submissions</h3>
        </div>
        <div className="divide-y divide-border">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {submission.delegate_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{submission.delegate_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.country} • {submission.submission_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={
                      submission.status === "graded" ? "badge-success" : "badge-warning"
                    }
                  >
                    {submission.status === "graded" ? "Graded" : "Pending"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No submissions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Submissions will appear here when delegates submit their work</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
