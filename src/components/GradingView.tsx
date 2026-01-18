import { useState } from "react";
import { Check, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const submissions = [
  {
    id: 1,
    name: "Alexandra Chen",
    country: "France",
    type: "Position Paper",
    submittedAt: "2 hours ago",
    graded: false,
    content: `The French Republic firmly believes that the current crisis in the Sahel region demands immediate and coordinated international action. As a permanent member of the United Nations Security Council and a nation with deep historical ties to the region, France is uniquely positioned to contribute to a comprehensive solution.

The delegation of France proposes a three-pillar approach:

First, we must address the immediate humanitarian concerns. The displacement of over 2.5 million people across the region requires urgent attention. France commits to increasing its humanitarian aid by 40% and calls upon fellow member states to match this commitment.

Second, the security situation cannot be ignored. The proliferation of armed groups threatens not only regional stability but also international peace. France supports the expansion of MINUSMA's mandate and offers additional training support for regional forces.

Third, and most critically, we must address the root causes of instability. Economic development, educational opportunities, and good governance are essential for lasting peace. France proposes the establishment of a UN Development Fund specifically targeted at the Sahel region.

The French delegation stands ready to work with all parties to achieve these objectives and restore peace and prosperity to this vital region.`,
  },
  {
    id: 2,
    name: "Marcus Williams",
    country: "United States",
    type: "Resolution Draft",
    submittedAt: "5 hours ago",
    graded: true,
    score: 8.5,
    content: `The United States of America approaches this matter with the gravity it deserves. As the largest contributor to UN peacekeeping operations, we understand the complexities of maintaining international peace and security...`,
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    country: "Brazil",
    type: "Position Paper",
    submittedAt: "1 day ago",
    graded: false,
    content: `Brazil, as the largest nation in South America and a key player in the Global South, brings a unique perspective to this discussion...`,
  },
  {
    id: 4,
    name: "James Kim",
    country: "Republic of Korea",
    type: "Amendment",
    submittedAt: "1 day ago",
    graded: true,
    score: 9.0,
    content: `The Republic of Korea proposes the following amendments to the working paper currently before this committee...`,
  },
];

export function GradingView() {
  const [selectedId, setSelectedId] = useState(submissions[0].id);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Grading View</h2>
        <p className="text-muted-foreground mt-1">
          Review and grade delegate submissions
        </p>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100%-5rem)]">
        {/* Left: Student List */}
        <div className="col-span-4 diplomatic-card-elevated overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="subsection-heading">Submissions</h3>
            <p className="text-sm text-muted-foreground">
              {submissions.filter((s) => !s.graded).length} pending review
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {submissions.map((submission) => (
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
                      "w-5 h-5 text-muted-foreground transition-transform",
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
              <div className="diplomatic-card-elevated p-6 flex-1 overflow-y-auto">
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
                      <Button className="w-full">Submit Grade</Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
