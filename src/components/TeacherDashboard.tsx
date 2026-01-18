import { Users, FileCheck, Award, TrendingUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    label: "Total Delegates",
    value: "48",
    change: "+4 this week",
    icon: Users,
    trend: "up",
  },
  {
    label: "Submissions",
    value: "32",
    change: "67% complete",
    icon: FileCheck,
    trend: "neutral",
  },
  {
    label: "Avg. Score",
    value: "8.4",
    change: "+0.3 from last session",
    icon: Award,
    trend: "up",
  },
  {
    label: "Active Sessions",
    value: "3",
    change: "DISEC, WHO, UNSC",
    icon: TrendingUp,
    trend: "neutral",
  },
];

const students = [
  {
    id: 1,
    name: "Alexandra Chen",
    country: "France",
    committee: "UNSC",
    status: "Active",
    score: 9.2,
  },
  {
    id: 2,
    name: "Marcus Williams",
    country: "United States",
    committee: "DISEC",
    status: "Active",
    score: 8.7,
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    country: "Brazil",
    committee: "WHO",
    status: "Pending",
    score: null,
  },
  {
    id: 4,
    name: "James Kim",
    country: "Republic of Korea",
    committee: "UNSC",
    status: "Active",
    score: 8.9,
  },
  {
    id: 5,
    name: "Emma Thompson",
    country: "United Kingdom",
    committee: "DISEC",
    status: "Active",
    score: 9.1,
  },
  {
    id: 6,
    name: "Ahmed Hassan",
    country: "Egypt",
    committee: "WHO",
    status: "Inactive",
    score: 7.5,
  },
];

export function TeacherDashboard() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h2 className="section-heading">Teacher Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Monitor delegate progress and manage your MUN sessions
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
                  <p className="text-3xl font-semibold font-heading mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-primary mt-1">{stat.change}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Management */}
      <div className="diplomatic-card-elevated">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="subsection-heading">Student Management</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {students.length} delegates enrolled
            </p>
          </div>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delegate Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Committee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.country}</TableCell>
                <TableCell>{student.committee}</TableCell>
                <TableCell>
                  <span
                    className={
                      student.status === "Active"
                        ? "badge-success"
                        : student.status === "Pending"
                        ? "badge-warning"
                        : "badge-status bg-muted text-muted-foreground"
                    }
                  >
                    {student.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {student.score ? (
                    <span className="font-medium">{student.score}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
