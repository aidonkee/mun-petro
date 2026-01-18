import { Settings, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const mockQuestions = [
  {
    id: 1,
    question: "What motion takes precedence over all others during formal debate?",
    type: "Multiple Choice",
    status: "Active",
  },
  {
    id: 2,
    question: "Which clause type uses italicized phrases and ends with a comma?",
    type: "Multiple Choice",
    status: "Active",
  },
  {
    id: 3,
    question: "What is the minimum number of sponsors typically required for a working paper?",
    type: "Multiple Choice",
    status: "Active",
  },
  {
    id: 4,
    question: "During an unmoderated caucus, delegates may:",
    type: "Multiple Choice",
    status: "Active",
  },
  {
    id: 5,
    question: "What does 'Yield to the Chair' mean at the end of a speech?",
    type: "Multiple Choice",
    status: "Active",
  },
];

export function QuizSettings() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">Quiz Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage quiz questions and settings
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {/* Settings Card */}
      <div className="diplomatic-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <h3 className="subsection-heading">Quiz Configuration</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiz-active" className="text-sm">
                Quiz Active
              </Label>
              <Switch id="quiz-active" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-answers" className="text-sm">
                Show Correct Answers After Submission
              </Label>
              <Switch id="show-answers" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-retry" className="text-sm">
                Allow Retakes
              </Label>
              <Switch id="allow-retry" defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="time-limit" className="text-sm mb-2 block">
                Time Limit (minutes)
              </Label>
              <Input
                id="time-limit"
                type="number"
                defaultValue={30}
                className="w-32"
              />
            </div>
            <div>
              <Label htmlFor="pass-score" className="text-sm mb-2 block">
                Passing Score (%)
              </Label>
              <Input
                id="pass-score"
                type="number"
                defaultValue={70}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="subsection-heading">Questions ({mockQuestions.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {mockQuestions.map((q, index) => (
            <div
              key={q.id}
              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <div>
                  <p className="font-medium">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-primary">{q.type}</span>
                    <span className="badge-success">{q.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
