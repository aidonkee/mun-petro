import { useState } from "react";
import { Plus, Trash2, GripVertical, Eye, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PREAMBULATORY_PHRASES = [
  "Affirming", "Alarmed by", "Aware of", "Bearing in mind", "Believing",
  "Confident", "Considering", "Convinced", "Declaring", "Deeply concerned",
  "Deeply conscious", "Deploring", "Desiring", "Emphasizing", "Expecting",
  "Guided by", "Having considered", "Keeping in mind", "Noting with regret",
  "Observing", "Reaffirming", "Realizing", "Recalling", "Recognizing",
  "Seeking", "Taking into account", "Welcoming",
];

const OPERATIVE_PHRASES = [
  "Accepts", "Affirms", "Approves", "Authorizes", "Calls upon", "Condemns",
  "Confirms", "Decides", "Declares", "Demands", "Deplores", "Designates",
  "Encourages", "Endorses", "Further invites", "Further recommends",
  "Further requests", "Invites", "Notes", "Proclaims", "Reaffirms",
  "Recommends", "Regrets", "Reminds", "Requests", "Strongly condemns",
  "Supports", "Takes note of", "Trusts", "Urges",
];

interface Clause {
  id: string;
  type: "preambulatory" | "operative";
  phrase: string;
  content: string;
}

export function DelegateResolution() {
  const [step, setStep] = useState<"preamble" | "operative">("preamble");
  const [topic, setTopic] = useState("Climate Action in Developing Nations");
  const [clauses, setClauses] = useState<Clause[]>([
    {
      id: "1",
      type: "preambulatory",
      phrase: "Recalling",
      content: "the Paris Agreement adopted on 12 December 2015",
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addClause = (type: "preambulatory" | "operative") => {
    const newClause: Clause = {
      id: Date.now().toString(),
      type,
      phrase: type === "preambulatory" ? "Recognizing" : "Requests",
      content: "",
    };
    setClauses([...clauses, newClause]);
  };

  const updateClause = (id: string, field: keyof Clause, value: string) => {
    setClauses(
      clauses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeClause = (id: string) => {
    setClauses(clauses.filter((c) => c.id !== id));
  };

  const preambulatories = clauses.filter((c) => c.type === "preambulatory");
  const operatives = clauses.filter((c) => c.type === "operative");

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="section-heading">Resolution Builder</h2>
          <p className="text-muted-foreground mt-1">
            Build your resolution step by step
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="diplomatic-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep("preamble")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              step === "preamble"
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm">
              1
            </span>
            Preambles
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setStep("operative")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              step === "operative"
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm">
              2
            </span>
            Operative Clauses
          </button>
        </div>
      </div>

      <div className={cn("grid gap-6", showPreview ? "grid-cols-2" : "grid-cols-1")}>
        {/* Builder */}
        <div className="space-y-6">
          {/* Topic */}
          <div className="diplomatic-card p-4">
            <label className="text-sm font-medium mb-2 block">
              Resolution Topic
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic..."
              className="text-lg font-heading"
            />
          </div>

          {/* Clauses Section */}
          {step === "preamble" ? (
            <div className="diplomatic-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="subsection-heading">Preambulatory Clauses</h3>
                  <p className="text-sm text-muted-foreground">
                    Set the context and reasoning
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => addClause("preambulatory")}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="divide-y divide-border">
                {preambulatories.map((clause, index) => (
                  <div key={clause.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <GripVertical className="w-4 h-4 cursor-move" />
                        <span className="text-sm font-medium w-6">{index + 1}.</span>
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        <Select
                          value={clause.phrase}
                          onValueChange={(v) => updateClause(clause.id, "phrase", v)}
                        >
                          <SelectTrigger className="col-span-4">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {PREAMBULATORY_PHRASES.map((phrase) => (
                              <SelectItem key={phrase} value={phrase}>
                                {phrase}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={clause.content}
                          onChange={(e) => updateClause(clause.id, "content", e.target.value)}
                          placeholder="Enter clause content..."
                          className="col-span-7"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="col-span-1 text-muted-foreground hover:text-destructive"
                          onClick={() => removeClause(clause.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {preambulatories.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No preambulatory clauses. Click "Add" to create one.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
                <Button onClick={() => setStep("operative")} className="gap-2">
                  Next: Operative Clauses
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="diplomatic-card overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="subsection-heading">Operative Clauses</h3>
                  <p className="text-sm text-muted-foreground">
                    Define the actions to be taken
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => addClause("operative")}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              <div className="divide-y divide-border">
                {operatives.map((clause, index) => (
                  <div key={clause.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <GripVertical className="w-4 h-4 cursor-move" />
                        <span className="text-sm font-medium w-6">{index + 1}.</span>
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-3">
                        <Select
                          value={clause.phrase}
                          onValueChange={(v) => updateClause(clause.id, "phrase", v)}
                        >
                          <SelectTrigger className="col-span-4">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {OPERATIVE_PHRASES.map((phrase) => (
                              <SelectItem key={phrase} value={phrase}>
                                {phrase}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={clause.content}
                          onChange={(e) => updateClause(clause.id, "content", e.target.value)}
                          placeholder="Enter clause content..."
                          className="col-span-7"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="col-span-1 text-muted-foreground hover:text-destructive"
                          onClick={() => removeClause(clause.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {operatives.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No operative clauses. Click "Add" to create one.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-muted/30 flex justify-between">
                <Button variant="outline" onClick={() => setStep("preamble")} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Preambles
                </Button>
                <Button>Submit Resolution</Button>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="diplomatic-card p-8 h-fit sticky top-6">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Draft Resolution
              </p>
              <h3 className="text-xl font-heading font-semibold">
                {topic || "Untitled Resolution"}
              </h3>
              <div className="h-px bg-border mt-4" />
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              {preambulatories.length > 0 && (
                <div className="space-y-3">
                  {preambulatories.map((clause) => (
                    <p key={clause.id}>
                      <span className="italic">{clause.phrase}</span>{" "}
                      {clause.content}
                      {clause.content && ","}
                    </p>
                  ))}
                </div>
              )}

              {operatives.length > 0 && (
                <div className="space-y-3">
                  {operatives.map((clause, index) => (
                    <p key={clause.id}>
                      <span className="font-medium">
                        {index + 1}. {clause.phrase}
                      </span>{" "}
                      {clause.content}
                      {index < operatives.length - 1 ? ";" : "."}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
