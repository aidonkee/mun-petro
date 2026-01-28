import { useState } from "react";
import { DelegateLayout } from "@/components/layouts/DelegateLayout";
import { DelegateHome } from "@/components/delegate/DelegateHome";
import { DelegateSpeech } from "@/components/delegate/DelegateSpeech";
import { DelegateResolution } from "@/components/delegate/DelegateResolution";
import { DelegateQuiz } from "@/components/delegate/DelegateQuiz";
import { DelegateProceduralActions } from "@/components/delegate/DelegateProceduralActions";
import { DelegatePositionPaper } from "@/components/delegate/DelegatePositionPaper";
import { DelegateSelfReflection } from "@/components/delegate/DelegateSelfReflection";

export default function DelegateDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DelegateHome onNavigate={setActiveView} />;
      case "speech":
        return <DelegateSpeech />;
      case "position-paper":
        return <DelegatePositionPaper />;
      case "resolution":
        return <DelegateResolution />;
      case "procedural":
        return <DelegateProceduralActions />;
      case "quiz":
        return <DelegateQuiz />;
      case "reflection":
        return <DelegateSelfReflection />;
      default:
        return <DelegateHome onNavigate={setActiveView} />;
    }
  };

  return (
    <DelegateLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </DelegateLayout>
  );
}
