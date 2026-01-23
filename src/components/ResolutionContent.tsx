import { useMemo } from "react";

interface Clause {
  id: string;
  type: "preambulatory" | "operative";
  phrase: string;
  content: string;
}

interface ResolutionData {
  topic: string;
  clauses: Clause[];
}

interface ResolutionContentProps {
  content: string;
}

export function ResolutionContent({ content }: ResolutionContentProps) {
  const parsedData = useMemo(() => {
    try {
      const data = JSON.parse(content) as ResolutionData;
      if (data.topic && Array.isArray(data.clauses)) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, [content]);

  if (!parsedData) {
    // Fallback: render as plain text
    return (
      <div className="prose prose-sm max-w-none">
        {content.split("\n\n").map((para, i) => (
          <p key={i} className="text-foreground leading-relaxed mb-4">
            {para}
          </p>
        ))}
      </div>
    );
  }

  const preambulatories = parsedData.clauses.filter((c) => c.type === "preambulatory");
  const operatives = parsedData.clauses.filter((c) => c.type === "operative");

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <div className="text-center pb-4 border-b border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Draft Resolution
        </p>
        <h3 className="text-lg font-heading font-semibold text-foreground">
          {parsedData.topic || "Untitled Resolution"}
        </h3>
      </div>

      {/* Preambulatory Clauses */}
      {preambulatories.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Preambulatory Clauses
          </p>
          {preambulatories.map((clause) => (
            <p key={clause.id} className="text-sm text-foreground leading-relaxed">
              <span className="italic font-medium">{clause.phrase}</span>{" "}
              {clause.content}
              {clause.content && ","}
            </p>
          ))}
        </div>
      )}

      {/* Operative Clauses */}
      {operatives.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Operative Clauses
          </p>
          {operatives.map((clause, index) => (
            <p key={clause.id} className="text-sm text-foreground leading-relaxed">
              <span className="font-semibold">
                {index + 1}. {clause.phrase}
              </span>{" "}
              {clause.content}
              {index < operatives.length - 1 ? ";" : "."}
            </p>
          ))}
        </div>
      )}

      {preambulatories.length === 0 && operatives.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No clauses in this resolution.
        </p>
      )}
    </div>
  );
}