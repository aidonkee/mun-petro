import { useEffect, useMemo, useState } from "react";
import { Loader2, FileText, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ResolutionContent } from "@/components/ResolutionContent";

type ItemKind =
  | "speech"
  | "position_paper"
  | "resolution"
  | "self_reflection"
  | "quiz_open";

interface UnifiedItem {
  id: string;
  kind: ItemKind;
  user_id: string;
  delegate_name: string;
  country: string;
  title: string;
  content: string;
  resolutionClauses?: unknown;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  created_at: string;
}

const KIND_LABELS: Record<ItemKind, string> = {
  speech: "Speech",
  position_paper: "Position Paper",
  resolution: "Resolution",
  self_reflection: "Self-Reflection",
  quiz_open: "Quiz Response",
};

export function AdminGrading() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterKind, setFilterKind] = useState<"all" | ItemKind>("all");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profilesRes, speechesRes, papersRes, resosRes, reflRes, quizRes] = await Promise.all([
        supabase.from("delegate_profiles").select("user_id, delegate_name, country"),
        supabase.from("speeches").select("*").in("status", ["submitted", "graded"]),
        supabase.from("position_papers").select("*").in("status", ["submitted", "graded"]),
        supabase.from("resolutions").select("*").in("status", ["submitted", "graded", "adopted"]),
        supabase.from("self_reflections").select("*").in("status", ["submitted", "graded"]),
        supabase.from("quiz_results").select("*").eq("pending_review", true),
      ]);

      const profiles = profilesRes.data || [];
      const profileMap = new Map<string, { delegate_name: string; country: string }>();
      profiles.forEach((p: any) => profileMap.set(p.user_id, { delegate_name: p.delegate_name, country: p.country }));

      const lookup = (uid: string) =>
        profileMap.get(uid) || { delegate_name: "Unknown delegate", country: "—" };

      const list: UnifiedItem[] = [];

      (speechesRes.data || []).forEach((s: any) => {
        const p = lookup(s.user_id);
        list.push({
          id: `speech-${s.id}`,
          kind: "speech",
          user_id: s.user_id,
          delegate_name: p.delegate_name,
          country: p.country,
          title: s.title || s.speech_type?.replace(/_/g, " ") || "Speech",
          content: s.content,
          status: s.status,
          score: s.score,
          feedback: s.feedback,
          submitted_at: s.submitted_at,
          created_at: s.created_at,
        });
      });

      (papersRes.data || []).forEach((pp: any) => {
        const p = lookup(pp.user_id);
        const content = [
          `BACKGROUND\n${pp.background_section || "—"}`,
          `COUNTRY POSITION\n${pp.country_position_section || "—"}`,
          `ALTERNATIVE VIEWPOINTS\n${pp.alternative_viewpoints_section || "—"}`,
          `PROPOSED SOLUTIONS\n${pp.proposed_solutions_section || "—"}`,
        ].join("\n\n");
        list.push({
          id: `paper-${pp.id}`,
          kind: "position_paper",
          user_id: pp.user_id,
          delegate_name: p.delegate_name,
          country: p.country,
          title: pp.topic || "Position Paper",
          content,
          status: pp.status,
          score: pp.score,
          feedback: pp.feedback,
          submitted_at: pp.submitted_at,
          created_at: pp.created_at,
        });
      });

      (resosRes.data || []).forEach((r: any) => {
        const p = lookup(r.user_id);
        list.push({
          id: `reso-${r.id}`,
          kind: "resolution",
          user_id: r.user_id,
          delegate_name: p.delegate_name,
          country: p.country,
          title: r.topic || "Resolution",
          content: JSON.stringify(r.clauses),
          resolutionClauses: r.clauses,
          status: r.status,
          score: r.score,
          feedback: r.feedback,
          submitted_at: r.submitted_at,
          created_at: r.created_at,
        });
      });

      (reflRes.data || []).forEach((r: any) => {
        const p = lookup(r.user_id);
        const content = [
          `MAIN CONTRIBUTION\n${r.main_contribution || "—"}`,
          `PROCEDURE EFFECTIVENESS\n${r.procedure_effectiveness || "—"}`,
          `IMPROVEMENT AREAS\n${r.improvement_areas || "—"}`,
          r.additional_notes ? `ADDITIONAL NOTES\n${r.additional_notes}` : "",
        ].filter(Boolean).join("\n\n");
        list.push({
          id: `refl-${r.id}`,
          kind: "self_reflection",
          user_id: r.user_id,
          delegate_name: p.delegate_name,
          country: p.country,
          title: "Self-Reflection",
          content,
          status: r.status,
          score: r.score,
          feedback: r.feedback,
          submitted_at: r.submitted_at,
          created_at: r.created_at,
        });
      });

      (quizRes.data || []).forEach((q: any) => {
        const p = lookup(q.user_id);
        const responses = Array.isArray(q.open_responses) ? q.open_responses : [];
        const content = responses
          .map((r: any, i: number) => `Q${i + 1}: ${r.question}\n\nAnswer: ${r.answer}`)
          .join("\n\n---\n\n") || "(no responses)";
        list.push({
          id: `quiz-${q.id}`,
          kind: "quiz_open",
          user_id: q.user_id,
          delegate_name: p.delegate_name,
          country: p.country,
          title: "Open-Ended Quiz Responses",
          content,
          status: q.manual_score != null ? "graded" : "submitted",
          score: q.manual_score,
          feedback: q.reviewer_feedback,
          submitted_at: q.completed_at,
          created_at: q.created_at,
        });
      });

      list.sort((a, b) => (b.submitted_at || b.created_at).localeCompare(a.submitted_at || a.created_at));
      setItems(list);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () => (filterKind === "all" ? items : items.filter((i) => i.kind === filterKind)),
    [items, filterKind]
  );

  const selected = filtered.find((i) => i.id === selectedId) || filtered[0];

  useEffect(() => {
    if (selected) {
      setScore(selected.score?.toString() ?? "");
      setFeedback(selected.feedback ?? "");
    }
  }, [selected?.id]);

  const handleGrade = async () => {
    if (!selected) return;
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 10) {
      toast({ title: "Invalid Score", description: "Score must be between 0 and 10", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Feedback Required", description: "Please provide feedback", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const rawId = selected.id.split("-").slice(1).join("-");
      let table = "";
      let updates: Record<string, unknown> = {};
      if (selected.kind === "speech") {
        table = "speeches";
        updates = { score: numScore, feedback: feedback.trim(), status: "graded", graded_at: new Date().toISOString() };
      } else if (selected.kind === "position_paper") {
        table = "position_papers";
        updates = { score: numScore, feedback: feedback.trim(), status: "graded", graded_at: new Date().toISOString() };
      } else if (selected.kind === "resolution") {
        table = "resolutions";
        updates = { score: numScore, feedback: feedback.trim(), status: "graded", graded_at: new Date().toISOString() };
      } else if (selected.kind === "self_reflection") {
        table = "self_reflections";
        updates = { score: numScore, feedback: feedback.trim(), status: "graded", graded_at: new Date().toISOString() };
      } else if (selected.kind === "quiz_open") {
        table = "quiz_results";
        updates = {
          manual_score: Math.round(numScore),
          reviewer_feedback: feedback.trim(),
          pending_review: false,
          reviewed_at: new Date().toISOString(),
        };
      }
      const { error } = await supabase.from(table as never).update(updates as never).eq("id" as never, rawId as never);
      if (error) throw error;
      toast({ title: "Saved", description: `${selected.delegate_name}'s ${KIND_LABELS[selected.kind]} graded` });
      await fetchAll();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save grade", variant: "destructive" });
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

  const fmt = (d: string | null) => {
    if (!d) return "—";
    try { return formatDistanceToNow(new Date(d), { addSuffix: true }); } catch { return "—"; }
  };

  const filters: ("all" | ItemKind)[] = ["all", "speech", "position_paper", "resolution", "self_reflection", "quiz_open"];

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="section-heading">Grading</h2>
        <p className="text-muted-foreground mt-1">All delegate submissions across the conference</p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filterKind === f ? "default" : "outline"}
            onClick={() => { setFilterKind(f); setSelectedId(null); }}
          >
            {f === "all" ? "All" : KIND_LABELS[f]}
            <span className="ml-2 text-xs opacity-70">
              {f === "all" ? items.length : items.filter((i) => i.kind === f).length}
            </span>
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="diplomatic-card p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">Delegate work will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 h-[calc(100%-9rem)]">
          <div className="col-span-4 diplomatic-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="subsection-heading">Submissions</h3>
              <p className="text-sm text-muted-foreground">
                {filtered.filter((i) => i.status === "submitted").length} pending
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50",
                    (selected?.id === item.id) && "bg-accent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.delegate_name}</span>
                        {item.status === "graded" && <Check className="w-4 h-4 text-success flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{item.country} • {item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-primary">{KIND_LABELS[item.kind]}</span>
                        <span className="text-xs text-muted-foreground">{fmt(item.submitted_at)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-8 flex flex-col gap-4">
            {selected && (
              <>
                <div className="diplomatic-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{selected.delegate_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selected.country} • {KIND_LABELS[selected.kind]} • {selected.title}
                      </p>
                    </div>
                  </div>
                  {selected.status === "graded" && selected.score != null && (
                    <div className="text-right">
                      <span className="text-2xl font-heading font-semibold text-primary">{selected.score}</span>
                      <p className="text-xs text-muted-foreground">/ 10</p>
                    </div>
                  )}
                </div>

                <div className="diplomatic-card p-6 flex-1 overflow-y-auto">
                  {selected.kind === "resolution" && selected.resolutionClauses ? (
                    <ResolutionContent content={JSON.stringify(selected.resolutionClauses)} />
                  ) : (
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                      {selected.content}
                    </div>
                  )}
                </div>

                <div className="diplomatic-card p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium mb-2 block">Score (0-10)</label>
                      <Input type="number" min="0" max="10" step="0.1" value={score}
                        onChange={(e) => setScore(e.target.value)} placeholder="8.5" />
                    </div>
                    <div className="col-span-8">
                      <label className="text-sm font-medium mb-2 block">Feedback</label>
                      <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback..." rows={2} />
                    </div>
                    <div className="col-span-2 flex items-end">
                      <Button className="w-full" onClick={handleGrade} disabled={submitting}>
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {selected.status === "graded" ? "Update" : "Submit"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}