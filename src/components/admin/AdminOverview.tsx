import { Users, FileCheck, Award, TrendingUp } from "lucide-react";
import { mockStudents, mockSubmissions } from "@/data/mockData";

const stats = [
  {
    label: "Total Delegates",
    value: mockStudents.length.toString(),
    change: `${mockStudents.filter((s) => s.status === "Active").length} active`,
    icon: Users,
  },
  {
    label: "Submissions",
    value: mockSubmissions.length.toString(),
    change: `${mockSubmissions.filter((s) => !s.graded).length} pending`,
    icon: FileCheck,
  },
  {
    label: "Avg. Score",
    value: (
      mockStudents
        .filter((s) => s.currentScore !== null)
        .reduce((acc, s) => acc + (s.currentScore || 0), 0) /
      mockStudents.filter((s) => s.currentScore !== null).length
    ).toFixed(1),
    icon: Award,
  },
  {
    label: "Quiz Completion",
    value: `${Math.round(
      (mockStudents.filter((s) => s.quizScore !== null).length /
        mockStudents.length) *
        100
    )}%`,
    icon: TrendingUp,
  },
];

export function AdminOverview() {
  const recentSubmissions = mockSubmissions.slice(0, 4);

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
          {recentSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{submission.name}</p>
                <p className="text-sm text-muted-foreground">
                  {submission.country} • {submission.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {submission.submittedAt}
                </span>
                <span
                  className={
                    submission.graded ? "badge-success" : "badge-warning"
                  }
                >
                  {submission.graded ? "Graded" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
