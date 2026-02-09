import { useState, useMemo, useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, Mic, MicOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { toast } from "@/hooks/use-toast";

const MAX_CHARACTERS = 1500;

// First-person words to detect and highlight
const FORBIDDEN_WORDS = ["I", "me", "my", "mine", "myself", "we", "us", "our", "ours", "ourselves"];

// Patterns for detection
const FIRST_PERSON_PATTERNS = FORBIDDEN_WORDS.map(
  (word) => new RegExp(`\\b${word}\\b`, word === "I" ? "g" : "gi")
);

export function DelegateSpeech() {
  const { submissions, loading, createSubmission, updateSubmission } = useSubmissions();
  const { profile } = useDelegateProfile();
  const [speech, setSpeech] = useState("");
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Voice recording hook
  const {
    isRecording,
    isSupported,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    resetTranscript,
    error: voiceError,
  } = useVoiceRecording({
    language: "en-US",
    onTranscript: (text) => {
      setSpeech(text);
    },
  });

  // Sync transcript to speech
  useEffect(() => {
    if (transcript) {
      setSpeech(transcript);
    }
  }, [transcript]);

  // Load existing draft or submitted speech
  useEffect(() => {
    const existingSpeech = submissions.find(
      (s) => s.submission_type === "speech" && (s.status === "draft" || s.status === "submitted")
    );
    if (existingSpeech) {
      setSpeech(existingSpeech.content);
      setCurrentSubmissionId(existingSpeech.id);
    }
  }, [submissions]);

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

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      toast({
        title: "Recording Stopped",
        description: "Voice recording has been stopped",
      });
    } else {
      // If starting fresh, sync the existing speech to transcript first
      if (speech && !transcript) {
        resetTranscript();
      }
      startRecording();
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    }
  };

  const handleResetRecording = () => {
    resetTranscript();
    setSpeech("");
    toast({
      title: "Speech Cleared",
      description: "Your speech has been cleared",
    });
  };

  const handleSaveDraft = async () => {
    if (!speech.trim()) {
      toast({
        title: "Empty Speech",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (currentSubmissionId) {
        await updateSubmission(currentSubmissionId, { content: speech });
      } else {
        const newSubmission = await createSubmission(
          profile?.delegate_name || "Current Delegate",
          profile?.country || "Unknown Country",
          "speech",
          speech,
          "draft"
        );
        setCurrentSubmissionId(newSubmission.id);
      }
      toast({
        title: "Draft Saved",
        description: "Your speech has been saved as a draft",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitSpeech = async () => {
    if (!isValid || characterCount > MAX_CHARACTERS) return;

    setSubmitting(true);
    try {
      if (currentSubmissionId) {
        await updateSubmission(currentSubmissionId, {
          content: speech,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        });
      } else {
        const newSubmission = await createSubmission(
          profile?.delegate_name || "Current Delegate",
          profile?.country || "Unknown Country",
          "speech",
          speech,
          "submitted"
        );
        setCurrentSubmissionId(newSubmission.id);
      }
      toast({
        title: "Speech Submitted",
        description: "Your opening speech has been submitted for review",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit speech",
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

  // Check if already submitted
  const existingSubmission = submissions.find(
    (s) => s.id === currentSubmissionId
  );
  const isSubmitted = existingSubmission?.status === "submitted" || existingSubmission?.status === "graded";

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Opening Speech Editor</h2>
        <p className="text-muted-foreground mt-1">
          Write your opening speech in third person or use voice recording
        </p>
      </div>

      {/* Grading Feedback (if graded) */}
      {existingSubmission?.status === "graded" && (
        <div className="diplomatic-card p-4 mb-6 bg-success/10 border-success/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-success">Graded</span>
            <span className="text-2xl font-heading font-semibold text-success">
              {existingSubmission.score}/10
            </span>
          </div>
          {existingSubmission.feedback && (
            <p className="text-sm text-muted-foreground">{existingSubmission.feedback}</p>
          )}
        </div>
      )}

      {/* Voice Recording Controls */}
      {!isSubmitted && (
        <div className="diplomatic-card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-full transition-colors",
                isRecording ? "bg-destructive/20 animate-pulse" : "bg-muted"
              )}>
                {isRecording ? (
                  <Mic className="w-6 h-6 text-destructive" />
                ) : (
                  <MicOff className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-medium">Voice Recording</h3>
                <p className="text-sm text-muted-foreground">
                  {!isSupported
                    ? "Voice recording is not supported in your browser"
                    : isRecording
                    ? "Recording... Speak now"
                    : "Click to start recording your speech"
                  }
                </p>
                {voiceError && (
                  <p className="text-sm text-destructive mt-1">Error: {voiceError}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isSupported && (
                <>
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="sm"
                    onClick={handleToggleRecording}
                    className="gap-2"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {speech && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetRecording}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Live transcript preview */}
          {interimTranscript && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground italic">
                {interimTranscript}...
              </p>
            </div>
          )}
        </div>
      )}

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
            <li>• You can dictate your speech using the voice recording feature</li>
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
            placeholder="Begin your opening speech here or use voice recording..."
            className="w-full min-h-[350px] p-6 text-base leading-relaxed resize-none bg-transparent focus:outline-none focus:ring-0 border-0 text-foreground"
            style={{ caretColor: "currentColor" }}
            disabled={isSubmitted}
          />

          {/* Highlighted overlay (read-only, behind textarea) */}
          <div
            className="absolute inset-0 p-6 text-base leading-relaxed pointer-events-none whitespace-pre-wrap break-words -z-10 text-transparent"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
          {!isSubmitted ? (
            <>
              <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Draft
              </Button>
              <Button
                disabled={!isValid || characterCount > MAX_CHARACTERS || submitting}
                onClick={handleSubmitSpeech}
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Speech
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Speech has been submitted
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
