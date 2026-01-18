import { useState } from "react";
import { DelegateLayout } from "@/components/layouts/DelegateLayout";
import { DelegateHome } from "@/components/delegate/DelegateHome";
import { DelegateSpeech } from "@/components/delegate/DelegateSpeech";
import { DelegateResolution } from "@/components/delegate/DelegateResolution";
import { DelegateQuiz } from "@/components/delegate/DelegateQuiz";

export default function DelegateDashboard() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DelegateHome />;
      case "speech":
        return <DelegateSpeech />;
      case "resolution":
        return <DelegateResolution />;
      case "quiz":
        return <DelegateQuiz />;
      default:
        return <DelegateHome />;
    }
  };

  return (
    <DelegateLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </DelegateLayout>
  );
}
