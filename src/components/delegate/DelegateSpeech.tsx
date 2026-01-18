import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_CHARACTERS = 1500;

// First-person words to detect and highlight
const FORBIDDEN_WORDS = ["I", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves"];

// Patterns for detection
const FIRST_PERSON_PATTERNS = FORBIDDEN_WORDS.map(
  (word) => new RegExp(`\\b${word}\\b`, word === "I" ? "g" : "gi")
);

export function DelegateSpeech() {
  const [speech, setSpeech] = useState(
    `The delegation of Germany rises to address this distinguished body on a matter of utmost importance.

Germany firmly believes that sustainable development cannot be achieved without addressing climate change. The German delegation calls upon all member states to honor their commitments.`
  );

  const characterCount = speech.length;
  const characterPercentage = (characterCount / MAX_CHARACTERS) * 100;

  // Find violations and their positions
  const { violations, violationCount, highlightedContent } = useMemo(() => {
    const foundViolations: string[] = [];
    let count = 0;

    FIRST_PERSON_PATTERNS.forEach((pattern, index) => {
      const matches = speech.match(pattern);
      if (matches) {
        count += matches.length;
        if (!foundViolations.includes(FORBIDDEN_WORDS[index].toLowerCase())) {
          foundViolations.push(FORBIDDEN_WORDS[index].toLowerCase());
        }
      }
    });

    // Create highlighted content
    let highlighted = speech;
    FORBIDDEN_WORDS.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, word === "I" ? "g" : "gi");
      highlighted = highlighted.replace(
        regex,
        '<mark class="bg-destructive/20 text-destructive font-medium px-0.5 rounded">$1</mark>'
      );
    });

    return {
      violations: foundViolations,
      violationCount: count,
      highlightedContent: highlighted,
    };
  }, [speech]);

  const isValid = violationCount === 0;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Opening Speech Editor</h2>
        <p className="text-muted-foreground mt-1">
          Write your opening speech in third person
        </p>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Third Person Status */}
        <div
          className={cn(
            "diplomatic-card p-4 flex items-center gap-4 transition-colors",
            isValid
              ? "border-success/50 bg-success/5"
              : "border-destructive/50 bg-destructive/5"
          )}
        >
          {isValid ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <AlertCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <h3 className="font-medium">Third Person Status</h3>
            {isValid ? (
              <p className="text-sm text-success">
                Excellent! No forbidden words detected
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Found: {violations.join(", ")} ({violationCount} total)
              </p>
            )}
          </div>
        </div>

        {/* Character Count & Forbidden Words Count */}
        <div className="diplomatic-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">Character Count</h3>
              <span
                className={cn(
                  "text-sm",
                  characterPercentage > 100
                    ? "text-destructive"
                    : characterPercentage > 80
                    ? "text-warning"
                    : "text-muted-foreground"
                )}
              >
                {characterCount} / {MAX_CHARACTERS}
              </span>
            </div>
            <div className="text-right">
              <h3 className="font-medium">Forbidden Words</h3>
              <span
                className={cn(
                  "text-sm font-semibold",
                  violationCount > 0 ? "text-destructive" : "text-success"
                )}
              >
                {violationCount}
              </span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                characterPercentage > 100
                  ? "bg-destructive"
                  : characterPercentage > 80
                  ? "bg-warning"
                  : "bg-primary"
              )}
              style={{ width: `${Math.min(characterPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="diplomatic-card p-4 mb-6 flex items-start gap-3 bg-accent">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-primary">Writing Tips</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>• Use "The delegation of [Country]" instead of "We" or "I"</li>
            <li>• Refer to your country in third person throughout</li>
            <li>
              • Forbidden words highlighted in{" "}
              <span className="text-destructive font-medium">red</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Editor with Highlighted Preview */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="subsection-heading">Speech Content</h3>
        </div>

        {/* Textarea with highlighting overlay */}
        <div className="relative">
          <textarea
            value={speech}
            onChange={(e) => setSpeech(e.target.value)}
            placeholder="Begin your opening speech here..."
            className="w-full min-h-[350px] p-6 text-base leading-relaxed resize-none bg-transparent focus:outline-none focus:ring-0 border-0 text-foreground"
            style={{ caretColor: "currentColor" }}
          />

          {/* Highlighted overlay (read-only, behind textarea) */}
          <div
            className="absolute inset-0 p-6 text-base leading-relaxed pointer-events-none whitespace-pre-wrap break-words -z-10 text-transparent"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
          <Button variant="outline">Save Draft</Button>
          <Button disabled={!isValid || characterCount > MAX_CHARACTERS}>
            Submit Speech
          </Button>
        </div>
      </div>
    </div>
  );
}
