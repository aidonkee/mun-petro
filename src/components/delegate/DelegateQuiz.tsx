import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What motion takes precedence over all others during formal debate?",
    options: [
      "Motion to Adjourn",
      "Point of Order",
      "Motion to Appeal the Chair's Decision",
      "Motion to Suspend the Meeting",
    ],
    correctIndex: 1,
    explanation:
      "A Point of Order takes precedence as it addresses a procedural violation that must be resolved before debate can continue.",
  },
  {
    id: 2,
    question: "Which clause type uses italicized phrases and ends with a comma?",
    options: [
      "Operative clauses",
      "Preambulatory clauses",
      "Amendment clauses",
      "Signatory clauses",
    ],
    correctIndex: 1,
    explanation:
      "Preambulatory clauses begin with italicized phrases (e.g., 'Recalling', 'Noting') and end with commas.",
  },
  {
    id: 3,
    question: "What is the minimum number of sponsors typically required for a working paper?",
    options: ["1 sponsor", "2 sponsors", "3 sponsors", "5 sponsors"],
    correctIndex: 0,
    explanation:
      "Most MUN conferences require at least 1 sponsor (the main author) for a working paper.",
  },
  {
    id: 4,
    question: "During an unmoderated caucus, delegates may:",
    options: [
      "Only speak through the Chair",
      "Freely move and discuss informally",
      "Not leave their seats",
      "Only write notes to other delegates",
    ],
    correctIndex: 1,
    explanation:
      "An unmoderated caucus allows delegates to leave their seats and engage in informal discussions.",
  },
  {
    id: 5,
    question: "What does 'Yield to the Chair' mean at the end of a speech?",
    options: [
      "The delegate asks for questions",
      "The delegate gives remaining time to another delegate",
      "The delegate forfeits their remaining time",
      "The delegate requests an extension",
    ],
    correctIndex: 2,
    explanation:
      "Yielding to the Chair means the delegate gives up any remaining speaking time.",
  },
];

export function DelegateQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasAnswered(true);
    if (selectedOption === currentQuestion.correctIndex) {
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
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = (score / questions.length) * 100;

    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className="diplomatic-card p-8 text-center">
          <div
            className={cn(
              "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
              percentage >= 80
                ? "bg-success/10"
                : percentage >= 60
                ? "bg-warning/10"
                : "bg-destructive/10"
            )}
          >
            {percentage >= 80 ? (
              <CheckCircle2 className="w-12 h-12 text-success" />
            ) : (
              <XCircle
                className={cn(
                  "w-12 h-12",
                  percentage >= 60 ? "text-warning" : "text-destructive"
                )}
              />
            )}
          </div>

          <h2 className="section-heading mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">
            {percentage >= 80
              ? "Excellent! You have a strong grasp of MUN rules."
              : percentage >= 60
              ? "Good effort! Review the rules to improve further."
              : "Keep studying! The rules will become clearer with practice."}
          </p>

          <div className="text-5xl font-heading font-bold text-secondary mb-2">
            {score} / {questions.length}
          </div>
          <p className="text-muted-foreground mb-8">{percentage}% correct</p>

          <Button onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="section-heading">Rules of Procedure Quiz</h2>
        <p className="text-muted-foreground mt-1">
          Test your knowledge of Model UN procedures
        </p>
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
            const isCorrect = index === currentQuestion.correctIndex;
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
        {hasAnswered && (
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
