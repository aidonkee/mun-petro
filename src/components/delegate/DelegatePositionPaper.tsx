import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { usePositionPapers, Source, PaperStatus } from "@/hooks/usePositionPapers";
import { cn } from "@/lib/utils";

const SECTION_LABELS = {
  background: "Background of the Issue",
  country_position: "Country Position",
  alternative_viewpoints: "Alternative Viewpoints",
  proposed_solutions: "Proposed Solutions",
};

const MIN_SOURCES = 2;

export function DelegatePositionPaper() {
  const { papers, loading, createPaper, updatePaper, countWords } = usePositionPapers();
  
  const [topic, setTopic] = useState('');
  const [background, setBackground] = useState('');
  const [countryPosition, setCountryPosition] = useState('');
  const [alternativeViewpoints, setAlternativeViewpoints] = useState('');
  const [proposedSolutions, setProposedSolutions] = useState('');
  const [sources, setSources] = useState<Source[]>([{ title: '', url: '' }]);
  const [currentPaperId, setCurrentPaperId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load existing paper
  useEffect(() => {
    const existingPaper = papers.find(p => p.status === 'draft' || p.status === 'submitted');
    if (existingPaper) {
      setTopic(existingPaper.topic);
      setBackground(existingPaper.background_section);
      setCountryPosition(existingPaper.country_position_section);
      setAlternativeViewpoints(existingPaper.alternative_viewpoints_section);
      setProposedSolutions(existingPaper.proposed_solutions_section);
      setSources(existingPaper.sources.length > 0 ? existingPaper.sources : [{ title: '', url: '' }]);
      setCurrentPaperId(existingPaper.id);
    }
  }, [papers]);

  const wordCounts = {
    background: countWords(background),
    country_position: countWords(countryPosition),
    alternative_viewpoints: countWords(alternativeViewpoints),
    proposed_solutions: countWords(proposedSolutions),
  };

  const totalWords = Object.values(wordCounts).reduce((a, b) => a + b, 0);
  const validSources = sources.filter(s => s.title.trim().length > 0);
  const hasMinSources = validSources.length >= MIN_SOURCES;
  const allSectionsFilled = background.trim() && countryPosition.trim() && alternativeViewpoints.trim() && proposedSolutions.trim();
  const canSubmit = topic.trim() && allSectionsFilled && hasMinSources;

  const addSource = () => {
    setSources([...sources, { title: '', url: '' }]);
  };

  const updateSource = (index: number, field: keyof Source, value: string) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    setSources(updated);
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const handleSaveDraft = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic Required", description: "Please enter a topic", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (currentPaperId) {
        await updatePaper(currentPaperId, {
          topic,
          background_section: background,
          country_position_section: countryPosition,
          alternative_viewpoints_section: alternativeViewpoints,
          proposed_solutions_section: proposedSolutions,
          sources: validSources,
        });
      } else {
        const paper = await createPaper(topic, background, countryPosition, alternativeViewpoints, proposedSolutions, validSources, 'draft');
        setCurrentPaperId(paper.id);
      }
      toast({ title: "Draft Saved", description: "Your position paper has been saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save draft", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({ title: "Cannot Submit", description: "Please complete all sections and add at least 2 sources", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (currentPaperId) {
        await updatePaper(currentPaperId, {
          topic,
          background_section: background,
          country_position_section: countryPosition,
          alternative_viewpoints_section: alternativeViewpoints,
          proposed_solutions_section: proposedSolutions,
          sources: validSources,
          status: 'submitted' as PaperStatus,
          submitted_at: new Date().toISOString(),
        });
      } else {
        const paper = await createPaper(topic, background, countryPosition, alternativeViewpoints, proposedSolutions, validSources, 'submitted');
        setCurrentPaperId(paper.id);
      }
      toast({ title: "Position Paper Submitted", description: "Your position paper has been submitted for review" });
    } catch {
      toast({ title: "Error", description: "Failed to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const existingPaper = papers.find(p => p.id === currentPaperId);
  const isSubmitted = existingPaper?.status === 'submitted' || existingPaper?.status === 'graded';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="section-heading">Position Paper</h2>
        <p className="text-muted-foreground mt-1">Compose your position paper with structured sections</p>
      </div>

      {/* Graded Feedback */}
      {existingPaper?.status === 'graded' && (
        <div className="diplomatic-card p-4 bg-success/10 border-success/50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Graded
            </span>
            <span className="text-2xl font-heading font-semibold text-success">{existingPaper.score}/10</span>
          </div>
          {existingPaper.feedback && (
            <p className="text-sm text-muted-foreground">{existingPaper.feedback}</p>
          )}
        </div>
      )}

      {/* Requirements Info */}
      <div className="diplomatic-card p-4 flex items-start gap-3 bg-accent">
        <Info className="w-5 h-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-primary">Position Paper Requirements</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li className={allSectionsFilled ? 'text-success' : ''}>
              • Complete all four sections
            </li>
            <li className={hasMinSources ? 'text-success' : ''}>
              • Include at least {MIN_SOURCES} sources
            </li>
          </ul>
        </div>
      </div>

      {/* Topic */}
      <div className="diplomatic-card p-4">
        <label className="text-sm font-medium mb-2 block">Topic / Agenda Item</label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter the topic you are addressing..."
          className="text-lg font-heading"
          disabled={isSubmitted}
        />
      </div>

      {/* Sections */}
      {Object.entries(SECTION_LABELS).map(([key, label]) => {
        const sectionKey = key as keyof typeof wordCounts;
        const value = 
          key === 'background' ? background :
          key === 'country_position' ? countryPosition :
          key === 'alternative_viewpoints' ? alternativeViewpoints :
          proposedSolutions;
        const setValue = 
          key === 'background' ? setBackground :
          key === 'country_position' ? setCountryPosition :
          key === 'alternative_viewpoints' ? setAlternativeViewpoints :
          setProposedSolutions;

        return (
          <div key={key} className="diplomatic-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="font-medium">{label}</h3>
              </div>
              <span className={cn(
                "text-sm",
                wordCounts[sectionKey] === 0 ? "text-muted-foreground" : "text-primary"
              )}>
                {wordCounts[sectionKey]} words
              </span>
            </div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Write your ${label.toLowerCase()} here...`}
              className="border-0 rounded-none min-h-[150px] resize-none focus-visible:ring-0"
              disabled={isSubmitted}
            />
          </div>
        );
      })}

      {/* Sources */}
      <div className="diplomatic-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Sources</h3>
            {!hasMinSources && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Minimum {MIN_SOURCES} required
              </span>
            )}
          </div>
          <span className={cn(
            "text-sm font-medium",
            hasMinSources ? "text-success" : "text-destructive"
          )}>
            {validSources.length} / {MIN_SOURCES}+
          </span>
        </div>
        <div className="p-4 space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="grid grid-cols-12 gap-3">
              <Input
                value={source.title}
                onChange={(e) => updateSource(index, 'title', e.target.value)}
                placeholder="Source title / description"
                className="col-span-6"
                disabled={isSubmitted}
              />
              <Input
                value={source.url || ''}
                onChange={(e) => updateSource(index, 'url', e.target.value)}
                placeholder="URL (optional)"
                className="col-span-5"
                disabled={isSubmitted}
              />
              <Button
                size="icon"
                variant="ghost"
                className="col-span-1"
                onClick={() => removeSource(index)}
                disabled={sources.length === 1 || isSubmitted}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {!isSubmitted && (
            <Button variant="outline" size="sm" onClick={addSource} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Source
            </Button>
          )}
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="diplomatic-card p-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{totalWords} words</span>
        </div>
        {!isSubmitted ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Draft
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Paper
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Position paper submitted
          </span>
        )}
      </div>
    </div>
  );
}
