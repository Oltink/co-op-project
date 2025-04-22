import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ScheduleGrid() {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);

  const [newCourse, setNewCourse] = useState("");
  const [newProfessor, setNewProfessor] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");

  const fetchData = async (token) => {
    try {
      const [timetableRes, courseRes, userRes] = await Promise.all([
        axios.get("http://localhost:5001/api/v1/timetables", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTimetables(timetableRes.data);
      setCourses(courseRes.data);
      const allProfs = userRes.data.filter(user => user.role === "professor");
      setProfessors(allProfs);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
    }
  };

  const handleAddTimetable = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5001/api/v1/courses/add-timetable", {
        courseId: newCourse,
        professorId: newProfessor,
        schedule: { day: newDay, time: newTime }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Slot added!");
      fetchData(token);
    } catch (err) {
      alert("❌ Error adding slot");
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("✅ Fetching schedule data with token:", token);
      fetchData(token);
    } else {
      console.warn("❗ No token found. Skipping schedule load.");
    }
  }, []);

  const timeOptions = [];
  for (let h = 9; h < 18; h++) {
    timeOptions.push(`${String(h).padStart(2, '0')}:00`);
    timeOptions.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>📅 Schedule Grid</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Course</th>
            <th>Professor</th>
            <th>Day</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map((item) => (
            <tr key={item._id}>
              <td>{courses.find(c => c._id === item.course)?.name || "Unknown"}</td>
              <td>{professors.find(p => p._id === item.professor)?.name || "Unknown"}</td>
              <td>{item.schedule?.day}</td>
              <td>{item.schedule?.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '30px' }}>➕ Add New Schedule Slot</h2>
      <select value={newCourse} onChange={(e) => setNewCourse(e.target.value)}>
        <option value="">Select Course</option>
        {courses.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <select value={newProfessor} onChange={(e) => setNewProfessor(e.target.value)} style={{ marginLeft: '10px' }}>
        <option value="">Select Professor</option>
        {professors.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      <select value={newDay} onChange={(e) => setNewDay(e.target.value)} style={{ marginLeft: '10px' }}>
        <option value="">Select Day</option>
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>

      <select value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{ marginLeft: '10px' }}>
        <option value="">Select Time</option>
        {timeOptions.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <button onClick={handleAddTimetable} style={{ marginLeft: '10px' }} disabled={!newCourse || !newProfessor || !newDay || !newTime}>
        Save Slot
      </button>
    </div>
  );
}
