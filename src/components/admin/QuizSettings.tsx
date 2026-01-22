import { useState } from "react";
import { Settings, Plus, Eye, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: number;
  status: "active" | "inactive";
}

interface QuizConfig {
  topic: string;
  description: string;
  isActive: boolean;
  showAnswers: boolean;
  allowRetakes: boolean;
  timeLimit: number;
  passingScore: number;
}

export function QuizSettings() {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<QuizConfig>({
    topic: "MUN Rules of Procedure",
    description: "Test your knowledge of Model UN parliamentary procedures",
    isActive: true,
    showAnswers: true,
    allowRetakes: true,
    timeLimit: 30,
    passingScore: 70,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 1,
      question: "What motion takes precedence over all others during formal debate?",
      type: "multiple_choice",
      options: ["Motion to Adjourn", "Point of Order", "Motion to Close Debate", "Motion to Suspend"],
      correctAnswer: 1,
      status: "active",
    },
    {
      id: 2,
      question: "Which clause type uses italicized phrases and ends with a comma?",
      type: "multiple_choice",
      options: ["Operative Clause", "Preambulatory Clause", "Amendment Clause", "Signature Clause"],
      correctAnswer: 1,
      status: "active",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<QuizQuestion | null>(null);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "multiple_choice" as "multiple_choice" | "true_false",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast({ title: "Error", description: "Please enter a question", variant: "destructive" });
      return;
    }

    const validOptions = newQuestion.type === "true_false" 
      ? ["True", "False"] 
      : newQuestion.options.filter(o => o.trim());
    
    if (newQuestion.type === "multiple_choice" && validOptions.length < 2) {
      toast({ title: "Error", description: "Please enter at least 2 answer options", variant: "destructive" });
      return;
    }

    const question: QuizQuestion = {
      id: Date.now(),
      question: newQuestion.question,
      type: newQuestion.type,
      options: validOptions,
      correctAnswer: newQuestion.correctAnswer,
      status: "active",
    };

    setQuestions([...questions, question]);
    setNewQuestion({ question: "", type: "multiple_choice", options: ["", "", "", ""], correctAnswer: 0 });
    setIsAddDialogOpen(false);
    toast({ title: "Success", description: "Question added successfully" });
  };

  const handleEditQuestion = () => {
    if (!editingQuestion) return;

    const validOptions = editingQuestion.type === "true_false"
      ? ["True", "False"]
      : editingQuestion.options.filter(o => o.trim());

    setQuestions(questions.map(q => 
      q.id === editingQuestion.id 
        ? { ...editingQuestion, options: validOptions }
        : q
    ));
    setIsEditDialogOpen(false);
    setEditingQuestion(null);
    toast({ title: "Success", description: "Question updated successfully" });
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast({ title: "Deleted", description: "Question removed" });
  };

  const handleToggleStatus = (id: number) => {
    setQuestions(questions.map(q => 
      q.id === id 
        ? { ...q, status: q.status === "active" ? "inactive" : "active" }
        : q
    ));
  };

  const handleSaveConfig = () => {
    toast({ title: "Saved", description: "Quiz configuration updated" });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-heading">Quiz Settings</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage quiz topics, questions and settings
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Enter your question..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Question Type</Label>
                <Select
                  value={newQuestion.type}
                  onValueChange={(value: "multiple_choice" | "true_false") => {
                    setNewQuestion({ 
                      ...newQuestion, 
                      type: value,
                      options: value === "true_false" ? ["True", "False"] : ["", "", "", ""],
                      correctAnswer: 0,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newQuestion.type === "multiple_choice" && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: index })}
                        className="w-4 h-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">Select the correct answer</p>
                </div>
              )}

              {newQuestion.type === "true_false" && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={newQuestion.correctAnswer === 0}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: 0 })}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tfAnswer"
                        checked={newQuestion.correctAnswer === 1}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: 1 })}
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Topic & Description */}
      <div className="diplomatic-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Edit className="w-5 h-5 text-primary" />
          </div>
          <h3 className="subsection-heading">Quiz Topic</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="topic">Main Topic</Label>
            <Input
              id="topic"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              placeholder="Enter quiz topic..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Enter quiz description..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="diplomatic-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h3 className="subsection-heading">Quiz Configuration</h3>
          </div>
          <Button size="sm" onClick={handleSaveConfig}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quiz-active" className="text-sm">
                Quiz Active
              </Label>
              <Switch 
                id="quiz-active" 
                checked={config.isActive}
                onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-answers" className="text-sm">
                Show Correct Answers After Submission
              </Label>
              <Switch 
                id="show-answers" 
                checked={config.showAnswers}
                onCheckedChange={(checked) => setConfig({ ...config, showAnswers: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-retry" className="text-sm">
                Allow Retakes
              </Label>
              <Switch 
                id="allow-retry" 
                checked={config.allowRetakes}
                onCheckedChange={(checked) => setConfig({ ...config, allowRetakes: checked })}
              />
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
                value={config.timeLimit}
                onChange={(e) => setConfig({ ...config, timeLimit: Number(e.target.value) })}
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
                value={config.passingScore}
                onChange={(e) => setConfig({ ...config, passingScore: Number(e.target.value) })}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="subsection-heading">Questions ({questions.length})</h3>
        </div>
        {questions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No questions yet. Click "Add Question" to create your first question.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {questions.map((q, index) => (
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
                      <span className="badge-primary">
                        {q.type === "multiple_choice" ? "Multiple Choice" : "True/False"}
                      </span>
                      <span 
                        className={q.status === "active" ? "badge-success" : "badge-secondary"}
                        onClick={() => handleToggleStatus(q.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {q.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground"
                    onClick={() => {
                      setViewingQuestion(q);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {/* Edit Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground"
                    onClick={() => {
                      setEditingQuestion({ ...q });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {/* Delete Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Question Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Question</DialogTitle>
          </DialogHeader>
          {viewingQuestion && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-foreground">Question</Label>
                <p className="font-medium mt-1">{viewingQuestion.question}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="mt-1">{viewingQuestion.type === "multiple_choice" ? "Multiple Choice" : "True/False"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Options</Label>
                <ul className="mt-1 space-y-1">
                  {viewingQuestion.options.map((option, i) => (
                    <li key={i} className={`flex items-center gap-2 ${i === viewingQuestion.correctAnswer ? "text-primary font-medium" : ""}`}>
                      {i === viewingQuestion.correctAnswer && <span>✓</span>}
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Question Type</Label>
                <Select
                  value={editingQuestion.type}
                  onValueChange={(value: "multiple_choice" | "true_false") => {
                    setEditingQuestion({ 
                      ...editingQuestion, 
                      type: value,
                      options: value === "true_false" ? ["True", "False"] : editingQuestion.options.length >= 2 ? editingQuestion.options : ["", "", "", ""],
                      correctAnswer: 0,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True / False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editingQuestion.type === "multiple_choice" && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editCorrectAnswer"
                        checked={editingQuestion.correctAnswer === index}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: index })}
                        className="w-4 h-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {editingQuestion.type === "true_false" && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editTfAnswer"
                        checked={editingQuestion.correctAnswer === 0}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: 0 })}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="editTfAnswer"
                        checked={editingQuestion.correctAnswer === 1}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: 1 })}
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleEditQuestion}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
