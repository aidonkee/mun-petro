import { useState, useMemo } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_CHARACTERS = 1500;

// Common first-person words to detect
const FIRST_PERSON_PATTERNS = [
  /\bI\b/g,
  /\bme\b/gi,
  /\bmy\b/gi,
  /\bmine\b/gi,
  /\bmyself\b/gi,
  /\bwe\b/gi,
  /\bus\b/gi,
  /\bour\b/gi,
  /\bours\b/gi,
  /\bourselves\b/gi,
];

export function OpeningSpeech() {
  const [speech, setSpeech] = useState(
    `The delegation of France rises to address this distinguished body on a matter of utmost importance to the international community.

France firmly believes that sustainable development cannot be achieved without first addressing the fundamental challenges of climate change. The Paris Agreement, forged through years of diplomatic effort, represents the collective will of nations to safeguard our planet for future generations.

The French delegation calls upon all member states to honor their commitments under this historic accord. France has demonstrated its dedication by pledging to achieve carbon neutrality by 2050 and by allocating substantial resources to green technology initiatives.

Furthermore, France proposes the establishment of a Global Climate Resilience Fund, designed to assist developing nations in adapting to the inevitable consequences of climate change. This fund would be administered under the auspices of the United Nations Environment Programme.

The delegation of France stands ready to work collaboratively with all parties present to craft a resolution that addresses these pressing concerns while respecting the sovereignty and unique circumstances of each member state.`
  );

  const characterCount = speech.length;
  const characterPercentage = (characterCount / MAX_CHARACTERS) * 100;

  const thirdPersonStatus = useMemo(() => {
    let violations: string[] = [];
    
    FIRST_PERSON_PATTERNS.forEach((pattern) => {
      const matches = speech.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (!violations.includes(match.toLowerCase())) {
            violations.push(match.toLowerCase());
          }
        });
      }
    });

    return {
      isValid: violations.length === 0,
      violations,
    };
  }, [speech]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Delegate Opening Speech</h2>
        <p className="text-muted-foreground mt-1">
          Compose your opening speech in third person, representing your
          assigned country
        </p>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Third Person Status */}
        <div
          className={cn(
            "diplomatic-card p-4 flex items-center gap-4 transition-colors",
            thirdPersonStatus.isValid
              ? "border-success/50 bg-success/5"
              : "border-destructive/50 bg-destructive/5"
          )}
        >
          {thirdPersonStatus.isValid ? (
            <CheckCircle2 className="w-8 h-8 text-success" />
          ) : (
            <AlertCircle className="w-8 h-8 text-destructive" />
          )}
          <div>
            <h3 className="font-medium">Third Person Status</h3>
            {thirdPersonStatus.isValid ? (
              <p className="text-sm text-success">
                Excellent! No first-person pronouns detected
              </p>
            ) : (
              <p className="text-sm text-destructive">
                Found: {thirdPersonStatus.violations.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Character Count */}
        <div className="diplomatic-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Character Count</h3>
            <span
              className={cn(
                "text-sm font-medium",
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
            <li>
              • Use "The delegation of [Country]" instead of "We" or "I"
            </li>
            <li>• Refer to your country in third person throughout</li>
            <li>• Maintain formal diplomatic language and tone</li>
          </ul>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-container">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="subsection-heading">Speech Content</h3>
        </div>
        <Textarea
          value={speech}
          onChange={(e) => setSpeech(e.target.value)}
          placeholder="Begin your opening speech here. Remember to speak in third person as the delegate of your assigned country..."
          className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none p-6 text-base leading-relaxed"
        />
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
          <Button variant="outline">Save Draft</Button>
          <Button disabled={!thirdPersonStatus.isValid || characterCount > MAX_CHARACTERS}>
            Submit Speech
          </Button>
        </div>
      </div>
    </div>
  );
}
