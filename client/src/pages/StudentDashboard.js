import React from "react";
import StudentSchedule from "./StudentSchedule";

export default function StudentDashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>🎓 Welcome, Student!</h1>

      {/* 👇 выводим компонент расписания */}
      <StudentSchedule />
    </div>
  );
}
