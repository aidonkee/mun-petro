import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuizData } from "@/hooks/useQuizData";

export function DelegateQuiz() {
  const { config, questions, loading } = useQuizData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config || !config.is_active) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="diplomatic-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="section-heading mb-2">Quiz Not Available</h2>
          <p className="text-muted-foreground">
            The quiz is currently inactive. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="diplomatic-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="section-heading mb-2">No Questions Available</h2>
          <p className="text-muted-foreground">
            The quiz has no questions yet. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasAnswered(true);
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    if (!config.allow_retakes) return;
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= config.passing_score;

    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="diplomatic-card p-8 text-center">
          <div
            className={cn(
              "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
              passed ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            {passed ? (
              <CheckCircle2 className="w-12 h-12 text-success" />
            ) : (
              <XCircle className="w-12 h-12 text-destructive" />
            )}
          </div>

          <h2 className="section-heading mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "Congratulations! You passed the quiz."
              : `You need ${config.passing_score}% to pass. Keep studying!`}
          </p>

          <div className="text-5xl font-heading font-bold text-secondary mb-2">
            {score} / {questions.length}
          </div>
          <p className="text-muted-foreground mb-8">{percentage}% correct</p>

          {config.allow_retakes && (
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">{config.topic}</h2>
        <p className="text-muted-foreground mt-1">{config.description}</p>
      </div>

      {/* Progress */}
      <div className="diplomatic-card p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-secondary font-medium">
            Score: {score}/{currentIndex + (hasAnswered ? 1 : 0)}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-300 rounded-full"
            style={{
              width: `${((currentIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="p-6 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correct_answer;
            const showCorrect = hasAnswered && isCorrect;
            const showWrong = hasAnswered && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={hasAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4",
                  isSelected && !hasAnswered && "border-secondary bg-secondary/5",
                  !isSelected && !hasAnswered && "border-border hover:border-secondary/50 hover:bg-muted/50",
                  showCorrect && "border-success bg-success/5",
                  showWrong && "border-destructive bg-destructive/5"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm flex-shrink-0",
                    isSelected && !hasAnswered
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : showCorrect
                      ? "border-success bg-success text-white"
                      : showWrong
                      ? "border-destructive bg-destructive text-white"
                      : "border-border"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1">{option}</span>
                {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                {showWrong && <XCircle className="w-5 h-5 text-destructive" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {hasAnswered && currentQuestion.explanation && (
          <div className="p-6 border-t border-border bg-accent animate-fade-in">
            <p className="text-sm">
              <span className="font-medium text-secondary">Explanation: </span>
              <span className="text-muted-foreground">
                {currentQuestion.explanation}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          {!hasAnswered ? (
            <Button onClick={handleSubmit} disabled={selectedOption === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                "View Results"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
