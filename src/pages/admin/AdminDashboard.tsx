import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { StudentManagement } from "@/components/admin/StudentManagement";
import { AdminGrading } from "@/components/admin/AdminGrading";
import { QuizSettings } from "@/components/admin/QuizSettings";

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("overview");

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <AdminOverview />;
      case "students":
        return <StudentManagement />;
      case "grading":
        return <AdminGrading />;
      case "quiz-settings":
        return <QuizSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </AdminLayout>
  );
}
