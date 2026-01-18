import { useState } from "react";
import { Check, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { mockSubmissions } from "@/data/mockData";

export function AdminGrading() {
  const [selectedId, setSelectedId] = useState(mockSubmissions[0].id);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedSubmission = mockSubmissions.find((s) => s.id === selectedId);

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Grading</h2>
        <p className="text-muted-foreground mt-1">
          Review and grade delegate submissions
        </p>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100%-5rem)]">
        {/* Left: Submission List */}
        <div className="col-span-4 diplomatic-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="subsection-heading">Submissions</h3>
            <p className="text-sm text-muted-foreground">
              {mockSubmissions.filter((s) => !s.graded).length} pending review
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {mockSubmissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => setSelectedId(submission.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50",
                  selectedId === submission.id && "bg-accent"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {submission.name}
                      </span>
                      {submission.graded && (
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {submission.country}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge-primary">{submission.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {submission.submittedAt}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-colors",
                      selectedId === submission.id && "text-primary"
                    )}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Submission Content */}
        <div className="col-span-8 flex flex-col gap-4">
          {selectedSubmission && (
            <>
              {/* Document Header */}
              <div className="diplomatic-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedSubmission.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSubmission.country} •{" "}
                      {selectedSubmission.type}
                    </p>
                  </div>
                </div>
                {selectedSubmission.graded && (
                  <div className="text-right">
                    <span className="text-2xl font-heading font-semibold text-primary">
                      {selectedSubmission.score}
                    </span>
                    <p className="text-xs text-muted-foreground">/ 10</p>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="diplomatic-card p-6 flex-1 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {selectedSubmission.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-foreground leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Grading Inputs */}
              {!selectedSubmission.graded && (
                <div className="diplomatic-card p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-2 block">
                        Score (0-10)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="8.5"
                      />
                    </div>
                    <div className="col-span-8">
                      <label className="text-sm font-medium mb-2 block">
                        Feedback
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback..."
                        className="resize-none h-10"
                        rows={1}
                      />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button className="w-full">Submit</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show existing feedback if graded */}
              {selectedSubmission.graded && selectedSubmission.feedback && (
                <div className="diplomatic-card p-4 bg-accent">
                  <p className="text-sm font-medium text-primary mb-1">
                    Feedback
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubmission.feedback}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
