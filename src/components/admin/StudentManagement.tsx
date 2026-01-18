import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockStudents } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function StudentManagement() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">Student Management</h2>
          <p className="text-muted-foreground mt-1">
            {mockStudents.length} delegates enrolled
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import CSV
        </Button>
      </div>

      {/* Table */}
      <div className="diplomatic-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Country</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">
                Current Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStudents.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.country}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "badge-status",
                      student.status === "Active" && "badge-success",
                      student.status === "Idle" &&
                        "bg-muted text-muted-foreground",
                      student.status === "Pending" && "badge-warning"
                    )}
                  >
                    {student.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {student.currentScore !== null ? (
                    <span className="font-semibold text-primary">
                      {student.currentScore.toFixed(1)}
                    </span>
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
