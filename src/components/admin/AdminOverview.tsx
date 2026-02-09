import { Users, FileCheck, Award, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AdminOverview() {
  // Fetch delegate profiles
  const { data: delegates = [], isLoading: delegatesLoading } = useQuery({
    queryKey: ["admin-delegates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delegate_profiles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch submissions
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

  // Fetch quiz results
  const { data: quizResults = [], isLoading: quizLoading } = useQuery({
    queryKey: ["admin-quiz-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*");
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
    {
      label: "Total Delegates",
      value: totalDelegates.toString(),
      change: `${activeDelegates} active`,
      icon: Users,
    },
    {
      label: "Submissions",
      value: submissions.length.toString(),
      change: `${pendingSubmissions} pending`,
      icon: FileCheck,
    },
    {
      label: "Avg. Score",
      value: avgScore,
      icon: Award,
    },
    {
      label: "Quiz Completion",
      value: `${quizCompletion}%`,
      icon: TrendingUp,
    },
  ];

  const recentSubmissions = submissions.slice(0, 4);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h2 className="section-heading">Overview</h2>
        <p className="text-muted-foreground mt-1">
          Monitor delegate progress and submissions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold font-heading mt-1">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-sm text-primary mt-1">{stat.change}</p>
                  )}
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <div className="diplomatic-card">
        <div className="p-4 border-b border-border">
          <h3 className="subsection-heading">Recent Submissions</h3>
        </div>
        <div className="divide-y divide-border">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{submission.delegate_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {submission.country} • {submission.submission_type}
                  </p>
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
            <div className="p-8 text-center text-muted-foreground">
              No submissions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
