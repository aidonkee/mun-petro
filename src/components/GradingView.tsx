import { useState } from "react";
import { Check, ChevronRight, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSubmissions } from "@/hooks/useSubmissions";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ResolutionContent } from "@/components/ResolutionContent";

const submissionTypeLabels: Record<string, string> = {
  speech: "Speech",
  position_paper: "Position Paper",
  resolution_draft: "Resolution Draft",
  amendment: "Amendment",
};

export function GradingView() {
  const { submissions, loading, gradeSubmission } = useSubmissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter to show only submitted or graded submissions
  const displaySubmissions = submissions.filter(
    (s) => s.status === "submitted" || s.status === "graded"
  );

  const selectedSubmission = displaySubmissions.find((s) => s.id === selectedId) || displaySubmissions[0];

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      toast({
        title: "Invalid Score",
        description: "Please enter a score between 0 and 10",
        variant: "destructive",
      });
      return;
    }

    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for the delegate",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await gradeSubmission(selectedSubmission.id, numScore, feedback.trim());
      toast({
        title: "Grade Submitted",
        description: `Successfully graded ${selectedSubmission.delegate_name}'s submission`,
      });
      setScore("");
      setFeedback("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Grading View</h2>
        <p className="text-muted-foreground mt-1">
          Review and grade delegate submissions
        </p>
      </div>

      {displaySubmissions.length === 0 ? (
        <div className="diplomatic-card-elevated p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No Submissions Yet</h3>
          <p className="text-muted-foreground">
            Delegate submissions will appear here once they submit their work.
          </p>
        </div>
      ) : (
        /* Split View */
        <div className="grid grid-cols-12 gap-6 h-[calc(100%-5rem)]">
          {/* Left: Student List */}
          <div className="col-span-4 diplomatic-card-elevated overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="subsection-heading">Submissions</h3>
              <p className="text-sm text-muted-foreground">
                {displaySubmissions.filter((s) => s.status === "submitted").length} pending review
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {displaySubmissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => setSelectedId(submission.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50",
                    (selectedId === submission.id || (!selectedId && submission.id === displaySubmissions[0]?.id)) && "bg-accent"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {submission.delegate_name}
                        </span>
                        {submission.status === "graded" && (
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {submission.country}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-primary">
                          {submissionTypeLabels[submission.submission_type] || submission.submission_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(submission.submitted_at)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        (selectedId === submission.id || (!selectedId && submission.id === displaySubmissions[0]?.id)) && "text-primary"
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
                      <h3 className="font-medium">{selectedSubmission.delegate_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.country} •{" "}
                        {submissionTypeLabels[selectedSubmission.submission_type] || selectedSubmission.submission_type}
                      </p>
                    </div>
                  </div>
                  {selectedSubmission.status === "graded" && (
                    <div className="text-right">
                      <span className="text-2xl font-heading font-semibold text-primary">
                        {selectedSubmission.score}
                      </span>
                      <p className="text-xs text-muted-foreground">/ 10</p>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="diplomatic-card-elevated p-6 flex-1 overflow-y-auto">
                  {selectedSubmission.submission_type === "resolution_draft" ? (
                    <ResolutionContent content={selectedSubmission.content} />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {selectedSubmission.content.split("\n\n").map((para, i) => (
                        <p key={i} className="text-foreground leading-relaxed mb-4">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grading Inputs */}
                {selectedSubmission.status === "submitted" && (
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
                          className="input-diplomatic"
                        />
                      </div>
                      <div className="col-span-8">
                        <label className="text-sm font-medium mb-2 block">
                          Feedback
                        </label>
                        <Textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide constructive feedback for the delegate..."
                          className="input-diplomatic resize-none h-10"
                          rows={1}
                        />
                      </div>
                      <div className="col-span-2 flex items-end">
                        <Button
                          className="w-full"
                          onClick={handleSubmitGrade}
                          disabled={submitting}
                        >
                          {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Submit Grade
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show existing feedback if graded */}
                {selectedSubmission.status === "graded" && selectedSubmission.feedback && (
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
      )}
    </div>
  );
}
