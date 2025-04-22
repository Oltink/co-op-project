import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProfessorDashboard() {
  const [timetables, setTimetables] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (token) => {
    try {
      const [timetableRes, meRes] = await Promise.all([
        axios.get("http://localhost:5001/api/v1/timetables/professor/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUser(meRes.data);
      setTimetables(
        timetableRes.data.filter(
          (t) => t.professor && String(t.professor._id) === String(meRes.data._id)
        )
      );
    } catch (err) {
      console.error("Error fetching professor's courses:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchData(token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const getColorForCourse = (courseId) => {
    const hash = [...courseId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 70%, 85%)`;
  };

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>👨‍🏫 Professor Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{ padding: "6px 12px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}
        >
          Logout
        </button>
      </div>

      <h2 style={{ marginTop: "30px" }}>📚 Your Courses</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Course</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Day</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map((t) => (
            <tr key={t._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px" }}>{t.course?.name || "Unknown"}</td>
              <td style={{ padding: "8px" }}>{t.schedule?.day}</td>
              <td style={{ padding: "8px" }}>{t.schedule?.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>📊 Visual Schedule</h2>
      <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", border: "1px solid #ccc" }}>
        <div></div>
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
          <div key={day} style={{ padding: "5px", textAlign: "center", fontWeight: "bold", background: "#f1f1f1" }}>{day}</div>
        ))}

        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(hour => (
          <React.Fragment key={hour}>
            <div style={{ padding: "5px", fontWeight: "bold", background: "#fafafa", borderTop: "1px solid #ccc" }}>{hour}</div>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
              const slot = timetables.find(t => t.schedule.day === day && t.schedule.time === hour);
              return (
                <div key={day + hour} style={{
                  minHeight: "40px",
                  borderTop: "1px solid #ccc",
                  borderLeft: "1px solid #ccc",
                  backgroundColor: slot ? getColorForCourse(slot.course?._id) : "#fff",
                  padding: "5px",
                  fontSize: "14px"
                }}>
                  {slot ? `${slot.course?.name}` : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
