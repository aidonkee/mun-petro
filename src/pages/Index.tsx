import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { GradingView } from "@/components/GradingView";
import { OpeningSpeech } from "@/components/OpeningSpeech";
import { ResolutionBuilder } from "@/components/ResolutionBuilder";
import { RulesQuiz } from "@/components/RulesQuiz";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <TeacherDashboard />;
      case "grading":
        return <GradingView />;
      case "speech":
        return <OpeningSpeech />;
      case "resolution":
        return <ResolutionBuilder />;
      case "quiz":
        return <RulesQuiz />;
      default:
        return <TeacherDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{renderView()}</div>
      </main>
    </div>
  );
};

export default Index;
