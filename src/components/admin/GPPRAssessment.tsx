import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, FileText, CheckCircle, Clock, AlertCircle, ChevronRight,
  Loader2, Plus, Trash2, Bot, Star, ArrowLeft, X, Download, BookOpen,
  Users, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GPPRSession {
  id: string;
  title: string;
  unit_or_term: string | null;
  criteria_summary: string | null;
  criteria_text: string | null;
  status: string;
  created_at: string;
}

interface StudentWork {
  id: string;
  session_id: string;
  student_name: string;
  file_name: string | null;
  file_path: string | null;
  file_type: string | null;
  ai_score: string | null;
  ai_feedback: string | null;
  ai_criteria_scores: Record<string, unknown> | null;
  status: string;
}

type View = "list" | "create" | "session";

export function GPPRAssessment() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [sessions, setSessions] = useState<GPPRSession[]>([]);
  const [activeSession, setActiveSession] = useState<GPPRSession | null>(null);
  const [works, setWorks] = useState<StudentWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newUnitTerm, setNewUnitTerm] = useState("");

  // Criteria upload
  const [criteriaFile, setCriteriaFile] = useState<File | null>(null);
  const [analyzingCriteria, setAnalyzingCriteria] = useState(false);
  const criteriaRef = useRef<HTMLInputElement>(null);

  // Student works upload
  const [pendingUploads, setPendingUploads] = useState<{ file: File; studentName: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [grading, setGrading] = useState(false);
  const worksRef = useRef<HTMLInputElement>(null);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from("gppr_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSessions((data as unknown as GPPRSession[]) || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load sessions", variant: "destructive" });
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const loadSessionWorks = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("gppr_student_works")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    setWorks((data as unknown as StudentWork[]) || []);
  };

  const openSession = async (session: GPPRSession) => {
    setActiveSession(session);
    setSelectedWork(null);
    await loadSessionWorks(session.id);
    setView("session");
  };

  const createSession = async () => {
    if (!newTitle.trim()) return toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gppr_sessions")
        .insert({ title: newTitle, unit_or_term: newUnitTerm || null, admin_id: user.id, status: "criteria_pending" })
        .select()
        .single();
      if (error) throw error;
      const session = data as unknown as GPPRSession;
      setActiveSession(session);
      setNewTitle("");
      setNewUnitTerm("");
      await loadSessionWorks(session.id);
      setView("session");
    } catch (err) {
      toast({ title: "Error", description: "Failed to create session", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const uploadAndAnalyzeCriteria = async () => {
    if (!criteriaFile || !activeSession) return;
    setAnalyzingCriteria(true);
    try {
      const ext = criteriaFile.name.split(".").pop();
      const filePath = `${activeSession.id}/criteria.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("gppr-criteria")
        .upload(filePath, criteriaFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from("gppr_sessions")
        .update({ criteria_file_path: filePath })
        .eq("id", activeSession.id);
      if (updateError) throw updateError;

      toast({ title: "Analyzing criteria...", description: "AI is reading the rubric document" });

      const { data: fnData, error: fnError } = await supabase.functions.invoke("gppr-analyze-criteria", {
        body: { sessionId: activeSession.id, filePath, fileType: criteriaFile.type },
      });

      if (fnError || fnData?.error) throw new Error(fnData?.error || fnError?.message);

      const updated = { ...activeSession, status: "criteria_ready", criteria_summary: fnData.summary, criteria_text: JSON.stringify(fnData.criteria) };
      setActiveSession(updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      setCriteriaFile(null);
      toast({ title: "Criteria analyzed!", description: "You can now upload student works", });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyze criteria";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAnalyzingCriteria(false);
    }
  };

  const addWorkFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      file,
      studentName: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
    }));
    setPendingUploads(prev => [...prev, ...newFiles].slice(0, 20));
  };

  const updateStudentName = (index: number, name: string) => {
    setPendingUploads(prev => prev.map((p, i) => i === index ? { ...p, studentName: name } : p));
  };

  const removeWork = (index: number) => {
    setPendingUploads(prev => prev.filter((_, i) => i !== index));
  };

  const uploadWorks = async () => {
    if (!activeSession || pendingUploads.length === 0) return;
    setUploading(true);
    try {
      for (const { file, studentName } of pendingUploads) {
        const ext = file.name.split(".").pop();
        const filePath = `${activeSession.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("gppr-works")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("gppr_student_works").insert({
          session_id: activeSession.id,
          student_name: studentName,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
          status: "pending",
        });
        if (insertError) throw insertError;
      }
      await loadSessionWorks(activeSession.id);
      setPendingUploads([]);
      toast({ title: "Works uploaded!", description: `${pendingUploads.length} works ready for grading` });
    } catch (err) {
      toast({ title: "Upload error", description: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const gradeAllWorks = async () => {
    if (!activeSession) return;
    setGrading(true);
    try {
      const pendingWorks = works.filter(w => w.status === "pending");
      if (pendingWorks.length === 0) {
        toast({ title: "No pending works", description: "All works are already graded or being processed" });
        return;
      }
      toast({ title: "Grading started", description: `AI is grading ${pendingWorks.length} works. This may take a few minutes...` });

      const { data, error } = await supabase.functions.invoke("gppr-grade-works", {
        body: { sessionId: activeSession.id },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);

      await loadSessionWorks(activeSession.id);
      toast({ title: "Grading complete!", description: `${data.total} works have been assessed by AI` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Grading failed";
      toast({ title: "Grading error", description: msg, variant: "destructive" });
      await loadSessionWorks(activeSession.id);
    } finally {
      setGrading(false);
    }
  };

  const deleteWork = async (workId: string) => {
    const { error } = await supabase.from("gppr_student_works").delete().eq("id", workId);
    if (error) return toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    setWorks(prev => prev.filter(w => w.id !== workId));
    if (selectedWork?.id === workId) setSelectedWork(null);
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase.from("gppr_sessions").delete().eq("id", sessionId);
    if (error) return toast({ title: "Error", description: "Failed to delete session", variant: "destructive" });
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "graded": return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Graded</Badge>;
      case "grading": return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Grading</Badge>;
      case "error": return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const criteriaReady = activeSession?.status === "criteria_ready";
  const pendingCount = works.filter(w => w.status === "pending").length;
  const gradedCount = works.filter(w => w.status === "graded").length;

  // Session list view
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">GPPR Assessment</h2>
            <p className="text-muted-foreground mt-1">Summative assessments for Global Perspective & Project Work</p>
          </div>
          <Button onClick={() => { setView("create"); }} className="gap-2">
            <Plus className="w-4 h-4" /> New Session
          </Button>
        </div>

        <div
          className="cursor-pointer"
          onClick={loadSessions}
        >
          {sessions.length === 0 && !loadingSessions && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No assessment sessions yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">Create a session, upload criteria, then let AI grade up to 20 student works at once.</p>
                <Button onClick={() => setView("create")} className="gap-2"><Plus className="w-4 h-4" />Create First Session</Button>
              </CardContent>
            </Card>
          )}

          {loadingSessions && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {sessions.length === 0 && !loadingSessions && (
          <div className="text-center">
            <Button variant="outline" onClick={loadSessions} className="gap-2">
              <Loader2 className={cn("w-4 h-4", loadingSessions && "animate-spin")} />
              Load Sessions
            </Button>
          </div>
        )}

        <div className="grid gap-4">
          {sessions.map(session => (
            <Card key={session.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openSession(session)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{session.title}</h3>
                      {session.unit_or_term && <Badge variant="outline" className="text-xs shrink-0">{session.unit_or_term}</Badge>}
                    </div>
                    {session.criteria_summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{session.criteria_summary}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(session.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={session.status === "criteria_ready" ? "default" : "secondary"} className="text-xs">
                      {session.status === "criteria_ready" ? "Ready" : "Criteria Pending"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); deleteSession(session.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sessions.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={loadSessions} size="sm" className="gap-2">
              <Loader2 className={cn("w-4 h-4", loadingSessions && "animate-spin")} />
              Refresh
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Create view
  if (view === "create") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView("list")} className="gap-2 -ml-2"><ArrowLeft className="w-4 h-4" />Back</Button>
        <div>
          <h2 className="text-2xl font-heading font-bold">New Assessment Session</h2>
          <p className="text-muted-foreground mt-1">Create a session for a unit or term assessment</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Session Title *</Label>
              <Input placeholder="e.g. Team Project — Biodiversity" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Unit / Term</Label>
              <Input placeholder="e.g. Unit 3, Term 2" value={newUnitTerm} onChange={e => setNewUnitTerm(e.target.value)} />
            </div>
            <Button className="w-full gap-2" onClick={createSession} disabled={loading || !newTitle.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session detail view
  if (view === "session" && activeSession) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setView("list"); loadSessions(); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-heading font-bold">{activeSession.title}</h2>
              {activeSession.unit_or_term && <p className="text-sm text-muted-foreground">{activeSession.unit_or_term}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{works.length} works</span>
            {gradedCount > 0 && <Badge className="bg-green-100 text-green-700">{gradedCount} graded</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Steps */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step 1: Criteria */}
            <Card className={cn("border-2", criteriaReady ? "border-green-200 bg-green-50/50" : "border-primary/20")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", criteriaReady ? "bg-green-500 text-white" : "bg-primary text-primary-foreground")}>
                    {criteriaReady ? <CheckCircle className="w-3.5 h-3.5" /> : "1"}
                  </div>
                  Assessment Criteria
                </CardTitle>
                <CardDescription>Upload the rubric / markscheme (PDF or image)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {criteriaReady ? (
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-green-800">{activeSession.criteria_summary}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => criteriaRef.current?.click()}>
                      <Upload className="w-3 h-3 mr-1.5" />Replace Criteria
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => criteriaRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); setCriteriaFile(e.dataTransfer.files[0]); }}
                  >
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">{criteriaFile ? criteriaFile.name : "Drop file here"}</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG supported</p>
                  </div>
                )}
                <input
                  ref={criteriaRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={e => setCriteriaFile(e.target.files?.[0] || null)}
                />
                {criteriaFile && !criteriaReady && (
                  <Button className="w-full gap-2" onClick={uploadAndAnalyzeCriteria} disabled={analyzingCriteria}>
                    {analyzingCriteria ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {analyzingCriteria ? "Analyzing..." : "Analyze with AI"}
                  </Button>
                )}
                {criteriaFile && criteriaReady && (
                  <Button className="w-full gap-2" size="sm" onClick={uploadAndAnalyzeCriteria} disabled={analyzingCriteria}>
                    {analyzingCriteria ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {analyzingCriteria ? "Updating..." : "Update Criteria"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Upload Works */}
            <Card className={cn("border-2", !criteriaReady && "opacity-60 pointer-events-none", criteriaReady && "border-muted")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">2</div>
                  Upload Student Works
                </CardTitle>
                <CardDescription>Upload up to 20 student submissions (PDF or image)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => worksRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); addWorkFiles(e.dataTransfer.files); }}
                >
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">Multiple files, max 20</p>
                </div>
                <input ref={worksRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" multiple className="hidden" onChange={e => addWorkFiles(e.target.files)} />

                {pendingUploads.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pendingUploads.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <Input
                          value={p.studentName}
                          onChange={e => updateStudentName(i, e.target.value)}
                          className="h-7 text-xs flex-1"
                          placeholder="Student name"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeWork(i)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingUploads.length > 0 && (
                  <Button className="w-full gap-2" onClick={uploadWorks} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : `Upload ${pendingUploads.length} Works`}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Grade */}
            {works.length > 0 && (
              <Card className="border-2 border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">3</div>
                    AI Grading
                  </CardTitle>
                  <CardDescription>{pendingCount} works pending · {gradedCount} graded</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    onClick={gradeAllWorks}
                    disabled={grading || pendingCount === 0}
                    variant={pendingCount > 0 ? "default" : "outline"}
                  >
                    {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {grading ? "Grading..." : `Grade ${pendingCount} Works`}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: Works list + Detail */}
          <div className="lg:col-span-2 space-y-4">
            {works.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">{criteriaReady ? "Upload student works to get started" : "Complete step 1 first"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {works.map(work => (
                  <Card
                    key={work.id}
                    className={cn("cursor-pointer transition-all hover:shadow-md", selectedWork?.id === work.id && "ring-2 ring-primary")}
                    onClick={() => setSelectedWork(selectedWork?.id === work.id ? null : work)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">{work.student_name}</span>
                          </div>
                          {work.file_name && <p className="text-xs text-muted-foreground truncate">{work.file_name}</p>}
                          {work.ai_score && (
                            <div className="flex items-center gap-2 mt-2">
                              <Star className="w-3.5 h-3.5 text-yellow-500" />
                              <span className="text-sm font-semibold text-foreground">{work.ai_score}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(work.status)}
                          <Button
                            variant="ghost" size="icon"
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                            onClick={e => { e.stopPropagation(); deleteWork(work.id); }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded: AI Results */}
                      {selectedWork?.id === work.id && work.status === "graded" && work.ai_criteria_scores && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* Criteria Breakdown */}
                          {(work.ai_criteria_scores as { criteria_scores?: Array<{ criterion: string; awarded_marks: number; max_marks: number; level_achieved: string; justification: string }> }).criteria_scores && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Criteria Breakdown</h4>
                              <div className="space-y-2">
                                {(work.ai_criteria_scores as { criteria_scores: Array<{ criterion: string; awarded_marks: number; max_marks: number; level_achieved: string; justification: string }> }).criteria_scores.map((cs, i) => (
                                  <div key={i} className="bg-muted/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">{cs.criterion}</span>
                                      <Badge variant="outline" className="text-xs">{cs.awarded_marks}/{cs.max_marks}</Badge>
                                    </div>
                                    {cs.level_achieved && <p className="text-xs text-primary font-medium mb-1">{cs.level_achieved}</p>}
                                    <p className="text-xs text-muted-foreground">{cs.justification}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Strengths & Improvements */}
                          <div className="grid grid-cols-2 gap-3">
                            {(work.ai_criteria_scores as { strengths?: string[] }).strengths && (
                              <div>
                                <h4 className="text-xs font-semibold text-green-700 mb-1.5">✓ Strengths</h4>
                                <ul className="space-y-1">
                                  {(work.ai_criteria_scores as { strengths: string[] }).strengths.map((s, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {(work.ai_criteria_scores as { improvements?: string[] }).improvements && (
                              <div>
                                <h4 className="text-xs font-semibold text-orange-700 mb-1.5">↑ To Improve</h4>
                                <ul className="space-y-1">
                                  {(work.ai_criteria_scores as { improvements: string[] }).improvements.map((s, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Overall Feedback */}
                          {work.ai_feedback && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Overall Feedback</h4>
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{work.ai_feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedWork?.id === work.id && work.status === "error" && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">{work.ai_feedback || "Grading failed"}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
