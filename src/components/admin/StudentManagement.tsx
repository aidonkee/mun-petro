import { useState, useRef } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockStudents, type Student } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    country: "",
    committee: "UNSC",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Simulate CSV import
    const mockNewStudents: Student[] = [
      {
        id: students.length + 1,
        name: "Imported Student 1",
        country: "Japan",
        committee: "UNSC",
        status: "Pending",
        currentScore: null,
        speechSubmitted: false,
        resolutionSubmitted: false,
        quizScore: null,
      },
      {
        id: students.length + 2,
        name: "Imported Student 2",
        country: "Canada",
        committee: "DISEC",
        status: "Pending",
        currentScore: null,
        speechSubmitted: false,
        resolutionSubmitted: false,
        quizScore: null,
      },
    ];

    setStudents((prev) => [...prev, ...mockNewStudents]);
    toast({
      title: "Import Successful",
      description: `${mockNewStudents.length} students imported from CSV`,
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.country.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const student: Student = {
      id: students.length + 1,
      name: newStudent.name.trim(),
      country: newStudent.country.trim(),
      committee: newStudent.committee,
      status: "Pending",
      currentScore: null,
      speechSubmitted: false,
      resolutionSubmitted: false,
      quizScore: null,
    };

    setStudents((prev) => [...prev, student]);
    setNewStudent({ name: "", country: "", committee: "UNSC" });
    setIsDialogOpen(false);
    toast({
      title: "Student Added",
      description: `${student.name} has been added to the roster`,
    });
  };

  const handleDeleteStudent = (id: number) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    toast({
      title: "Student Removed",
      description: `${student?.name} has been removed from the roster`,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">Student Management</h2>
          <p className="text-muted-foreground mt-1">
            {students.length} delegates enrolled
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newStudent.country}
                    onChange={(e) =>
                      setNewStudent((prev) => ({ ...prev, country: e.target.value }))
                    }
                    placeholder="Enter assigned country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee">Committee</Label>
                  <Select
                    value={newStudent.committee}
                    onValueChange={(value) =>
                      setNewStudent((prev) => ({ ...prev, committee: value }))
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select committee" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="UNSC">UNSC</SelectItem>
                      <SelectItem value="DISEC">DISEC</SelectItem>
                      <SelectItem value="WHO">WHO</SelectItem>
                      <SelectItem value="ECOFIN">ECOFIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddStudent} className="w-full">
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2" onClick={handleBulkImport}>
            <Upload className="w-4 h-4" />
            Bulk Import CSV
          </Button>
        </div>
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
              <TableHead className="font-semibold text-right w-20">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
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
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
