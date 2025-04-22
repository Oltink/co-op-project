import React, { useEffect, useState } from "react";
import axios from "axios";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export default function SchedulerDashboard() {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const [timetableRes, courseRes, userRes] = await Promise.all([
      axios.get("http://localhost:5001/api/v1/timetables", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5001/api/v1/courses", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("http://localhost:5001/api/v1/users", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    setTimetables(timetableRes.data);
    setCourses(courseRes.data);
    setProfessors(userRes.data.filter(u => u.role === "professor"));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTimetables = timetables.filter(t => {
    const matchesProf = selectedProfessor ? t.professor?._id === selectedProfessor : true;
    const matchesCourse = selectedCourse ? t.course?._id === selectedCourse : true;
    return matchesProf && matchesCourse;
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1>📅 Scheduler Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <select onChange={e => setSelectedProfessor(e.target.value)} value={selectedProfessor}>
          <option value="">Select Professor</option>
          {professors.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <select onChange={e => setSelectedCourse(e.target.value)} value={selectedCourse}>
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "600px" }}>
          <thead>
            <tr>
              <th></th>
              {days.map(day => (
                <th key={day} style={{ padding: "8px", border: "1px solid #ccc", backgroundColor: "#f0f0f0" }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time}>
                <td style={{ padding: "8px", border: "1px solid #ccc", backgroundColor: "#f0f0f0" }}>{time}</td>
                {days.map(day => {
                  const timetable = filteredTimetables.find(t => t.schedule?.day === day && t.schedule?.time === time);
                  return (
                    <td key={day + time} style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>
                      {timetable ? (
                        <div style={{ backgroundColor: "#d0ebff", padding: "4px", borderRadius: "4px" }}>
                          {timetable.course?.name || "Unknown"}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
