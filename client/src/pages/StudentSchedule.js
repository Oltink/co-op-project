import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentSchedule() {
  const [timetables, setTimetables] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async (token) => {
    try {
      const [timetableRes, meRes] = await Promise.all([
        axios.get("http://localhost:5001/api/v1/timetables", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTimetables(timetableRes.data);
      setEnrolledCourses(meRes.data.enrolledCourses || []);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
    }
  };

  const handleEnroll = async (timetableId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5001/api/v1/timetables/enroll",
        { timetableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(token);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to enroll");
    }
  };

  const handleUnenroll = async (timetableId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5001/api/v1/timetables/unenroll",
        { timetableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(token);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to unenroll");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };
  
  const getColorForCourse = (courseId) => {
    const hash = [...courseId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `hsl(${hash % 360}, 70%, 85%)`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchData(token);
  }, []);

  const filteredTimetables = timetables.filter(
    (t) =>
      t.course?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.professor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "10px" }}>🟦 Available Timetables</h2>
        <button onClick={handleLogout} style={{ padding: "6px 12px", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
          Logout
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by course or professor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "15px", padding: "8px", width: "100%", maxWidth: "400px" }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead style={{ backgroundColor: "#eee" }}>
          <tr>
            <th style={{ padding: "10px" }}>Course</th>
            <th style={{ padding: "10px" }}>Professor</th>
            <th style={{ padding: "10px" }}>Day</th>
            <th style={{ padding: "10px" }}>Time</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTimetables.map((t) => (
            <tr key={t._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px" }}>{t.course?.name || "Unknown"}</td>
              <td style={{ padding: "8px" }}>{t.professor?.name || "Unknown"}</td>
              <td style={{ padding: "8px" }}>{t.schedule?.day}</td>
              <td style={{ padding: "8px" }}>{t.schedule?.time}</td>
              <td style={{ padding: "8px" }}>
                <button
                  onClick={() => handleEnroll(t._id)}
                  disabled={enrolledCourses.includes(t._id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: enrolledCourses.includes(t._id) ? "#aaa" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: enrolledCourses.includes(t._id) ? "not-allowed" : "pointer",
                  }}
                >
                  {enrolledCourses.includes(t._id) ? "Enrolled" : "Enroll"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>📚 My Enrolled Courses</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "40px" }}>
        <thead style={{ backgroundColor: "#f5f5f5" }}>
          <tr>
            <th style={{ padding: "10px" }}>Course</th>
            <th style={{ padding: "10px" }}>Professor</th>
            <th style={{ padding: "10px" }}>Day</th>
            <th style={{ padding: "10px" }}>Time</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {timetables
            .filter((t) => enrolledCourses.includes(t._id))
            .map((t) => (
              <tr key={t._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{t.course?.name || "Unknown"}</td>
                <td style={{ padding: "8px" }}>{t.professor?.name || "Unknown"}</td>
                <td style={{ padding: "8px" }}>{t.schedule?.day}</td>
                <td style={{ padding: "8px" }}>{t.schedule?.time}</td>
                <td style={{ padding: "8px" }}>
                  <button
                    onClick={() => handleUnenroll(t._id)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Unenroll
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <h2>📊 My Visual Schedule</h2>
      <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", border: "1px solid #ccc" }}>
        <div></div>
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
          <div key={day} style={{ padding: "5px", textAlign: "center", fontWeight: "bold", background: "#f1f1f1" }}>{day}</div>
        ))}
        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(hour => (
          <React.Fragment key={hour}>
            <div style={{ padding: "5px", fontWeight: "bold", background: "#fafafa", borderTop: "1px solid #ccc" }}>{hour}</div>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
              const slot = timetables.find(t =>
                enrolledCourses.includes(t._id) &&
                t.schedule.day === day &&
                t.schedule.time === hour
              );
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
