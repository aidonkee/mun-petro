import { useState } from "react";
import { Hand, AlertCircle, Vote, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useProceduralActions, MotionType, PointType } from "@/hooks/useProceduralActions";
import { useVotingRecords, VoteOption, VoteSubjectType } from "@/hooks/useVotingRecords";
import { formatDistanceToNow } from "date-fns";

const MOTION_LABELS: Record<MotionType, string> = {
  moderated_caucus: "Moderated Caucus",
  unmoderated_caucus: "Unmoderated Caucus",
  close_debate: "Close Debate",
  suspend_meeting: "Suspend the Meeting",
  adjourn_meeting: "Adjourn the Meeting",
  introduce_draft_resolution: "Introduce Draft Resolution",
  divide_the_question: "Divide the Question",
};

const POINT_LABELS: Record<PointType, string> = {
  point_of_order: "Point of Order",
  point_of_information: "Point of Information",
  point_of_personal_privilege: "Point of Personal Privilege",
  point_of_inquiry: "Point of Inquiry",
  right_of_reply: "Right of Reply",
};

export function DelegateProceduralActions() {
  const { actions, loading, createMotion, createPoint } = useProceduralActions();
  const { votes, castVote, getVotingStats } = useVotingRecords();
  
  const [activeTab, setActiveTab] = useState<'motion' | 'point' | 'vote' | 'history'>('motion');
  const [selectedMotion, setSelectedMotion] = useState<MotionType | ''>('');
  const [selectedPoint, setSelectedPoint] = useState<PointType | ''>('');
  const [description, setDescription] = useState('');
  const [voteSubject, setVoteSubject] = useState('');
  const [voteSubjectType, setVoteSubjectType] = useState<VoteSubjectType>('motion');
  const [selectedVote, setSelectedVote] = useState<VoteOption | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleRaiseMotion = async () => {
    if (!selectedMotion) {
      toast({ title: "Select Motion Type", description: "Please select a motion type", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createMotion(selectedMotion, description || undefined);
      toast({ title: "Motion Raised", description: `Motion for ${MOTION_LABELS[selectedMotion]} has been logged` });
      setSelectedMotion('');
      setDescription('');
    } catch {
      toast({ title: "Error", description: "Failed to raise motion", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRaisePoint = async () => {
    if (!selectedPoint) {
      toast({ title: "Select Point Type", description: "Please select a point type", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createPoint(selectedPoint, description || undefined);
      toast({ title: "Point Raised", description: `${POINT_LABELS[selectedPoint]} has been logged` });
      setSelectedPoint('');
      setDescription('');
    } catch {
      toast({ title: "Error", description: "Failed to raise point", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCastVote = async () => {
    if (!voteSubject.trim() || !selectedVote) {
      toast({ title: "Complete Vote", description: "Please specify the subject and your vote", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await castVote(voteSubject, voteSubjectType, selectedVote);
      toast({ title: "Vote Recorded", description: `Your vote has been recorded` });
      setVoteSubject('');
      setSelectedVote('');
    } catch {
      toast({ title: "Error", description: "Failed to record vote", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const stats = getVotingStats();

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
        <h2 className="section-heading">Procedural Actions</h2>
        <p className="text-muted-foreground mt-1">Log your procedural participation</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="diplomatic-card p-4 text-center">
          <p className="text-2xl font-heading font-semibold text-primary">{actions.filter(a => a.action_type === 'motion').length}</p>
          <p className="text-sm text-muted-foreground">Motions Raised</p>
        </div>
        <div className="diplomatic-card p-4 text-center">
          <p className="text-2xl font-heading font-semibold text-primary">{actions.filter(a => a.action_type === 'point').length}</p>
          <p className="text-sm text-muted-foreground">Points Raised</p>
        </div>
        <div className="diplomatic-card p-4 text-center">
          <p className="text-2xl font-heading font-semibold text-primary">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Votes Cast</p>
        </div>
        <div className="diplomatic-card p-4 text-center">
          <p className="text-2xl font-heading font-semibold text-success">{stats.forVotes}</p>
          <p className="text-sm text-muted-foreground">In Favor</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="diplomatic-card p-2 flex gap-2">
        {[
          { id: 'motion', label: 'Raise Motion', icon: Hand },
          { id: 'point', label: 'Raise Point', icon: AlertCircle },
          { id: 'vote', label: 'Cast Vote', icon: Vote },
          { id: 'history', label: 'History', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Motion Form */}
      {activeTab === 'motion' && (
        <div className="diplomatic-card p-6 space-y-4">
          <h3 className="subsection-heading">Raise a Motion</h3>
          <Select value={selectedMotion} onValueChange={(v) => setSelectedMotion(v as MotionType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select motion type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MOTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add details (e.g., caucus topic, duration)..."
            rows={3}
          />
          <Button onClick={handleRaiseMotion} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Raise Motion
          </Button>
        </div>
      )}

      {/* Point Form */}
      {activeTab === 'point' && (
        <div className="diplomatic-card p-6 space-y-4">
          <h3 className="subsection-heading">Raise a Point</h3>
          <Select value={selectedPoint} onValueChange={(v) => setSelectedPoint(v as PointType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select point type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POINT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add details about your point..."
            rows={3}
          />
          <Button onClick={handleRaisePoint} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Raise Point
          </Button>
        </div>
      )}

      {/* Vote Form */}
      {activeTab === 'vote' && (
        <div className="diplomatic-card p-6 space-y-4">
          <h3 className="subsection-heading">Cast Your Vote</h3>
          <Select value={voteSubjectType} onValueChange={(v) => setVoteSubjectType(v as VoteSubjectType)}>
            <SelectTrigger>
              <SelectValue placeholder="Vote on..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="motion">Motion</SelectItem>
              <SelectItem value="resolution">Resolution</SelectItem>
              <SelectItem value="amendment">Amendment</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={voteSubject}
            onChange={(e) => setVoteSubject(e.target.value)}
            placeholder="Describe what you are voting on..."
            rows={2}
          />
          <div className="grid grid-cols-3 gap-3">
            {(['for', 'against', 'abstain'] as VoteOption[]).map(option => (
              <Button
                key={option}
                variant={selectedVote === option ? 'default' : 'outline'}
                onClick={() => setSelectedVote(option)}
                className={`capitalize ${
                  selectedVote === option
                    ? option === 'for' ? 'bg-success hover:bg-success/90' : 
                      option === 'against' ? 'bg-destructive hover:bg-destructive/90' : ''
                    : ''
                }`}
              >
                {option === 'for' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                {option === 'against' && <XCircle className="w-4 h-4 mr-2" />}
                {option}
              </Button>
            ))}
          </div>
          <Button onClick={handleCastVote} disabled={submitting} className="w-full">
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Record Vote
          </Button>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="diplomatic-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="subsection-heading">Procedural History</h3>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {[...actions, ...votes.map(v => ({ ...v, action_type: 'vote' as const }))].length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">No procedural actions recorded yet</p>
            ) : (
              [...actions.map(a => ({ ...a, sortDate: new Date(a.created_at) })), 
               ...votes.map(v => ({ ...v, action_type: 'vote' as const, sortDate: new Date(v.created_at) }))]
                .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
                .map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.action_type === 'motion' && <Hand className="w-5 h-5 text-primary" />}
                      {item.action_type === 'point' && <AlertCircle className="w-5 h-5 text-warning" />}
                      {item.action_type === 'vote' && <Vote className="w-5 h-5 text-secondary" />}
                      <div>
                        <p className="font-medium">
                          {item.action_type === 'motion' && 'motion_type' in item && item.motion_type && MOTION_LABELS[item.motion_type]}
                          {item.action_type === 'point' && 'point_type' in item && item.point_type && POINT_LABELS[item.point_type]}
                          {item.action_type === 'vote' && 'vote_subject' in item && item.vote_subject}
                        </p>
                        {'description' in item && item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        {item.action_type === 'vote' && 'vote' in item && (
                          <span className={`text-sm font-medium ${
                            item.vote === 'for' ? 'text-success' : 
                            item.vote === 'against' ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            Voted: {item.vote}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(item.sortDate, { addSuffix: true })}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
