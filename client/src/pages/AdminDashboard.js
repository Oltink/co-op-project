import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseId, setCourseId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [optimized, setOptimized] = useState([]);


  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [usersRes, coursesRes, timetableRes] = await Promise.all([
        axios.get("http://localhost:5001/api/v1/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5001/api/v1/timetables", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setTimetables(timetableRes.data);
      setProfessors(usersRes.data.filter(u => u.role === 'professor'));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignStudentToCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/v1/courses/assign-student",
        { courseId: selectedCourse, studentId: selectedStudent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Student assigned to course successfully");
    } catch (err) {
      console.error("Assignment failed:", err.response?.data || err.message);
      alert("Failed to assign student");
    }
  };

  const handleCreateTimetable = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5001/api/v1/courses/add-timetable", {
        courseId,
        professorId,
        schedule: { day, time },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Schedule created successfully");
      fetchData();
    } catch (err) {
      alert("❌ Failed to create schedule");
      console.error(err);
    }
  };

  const handleDeleteTimetable = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5001/api/v1/timetables/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("❌ Failed to delete timetable");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseColors = {};
  const getColorForCourse = (courseId) => {
    if (!courseColors[courseId]) {
      const hue = Object.keys(courseColors).length * 50;
      courseColors[courseId] = `hsl(${hue % 360}, 80%, 85%)`;
    }
    return courseColors[courseId];
  };
  
  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return alert("Введите название курса");
  
    const token = localStorage.getItem("token");
    try {
        await axios.post("http://localhost:5001/api/v1/courses/create-course", {
            name: newCourseName
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
  
      alert("✅ Курс создан");
      setNewCourseName("");
      fetchData(); 
    } catch (err) {
      console.error("Ошибка при создании курса", err);
      alert("❌ Ошибка при создании курса");
    }
  };
  
  const handleOptimize = async () => {
    try {
      console.log("Sending to AI optimizer:", JSON.stringify({ timetables, users }, null, 2)); // добавь эту строку
  
      const res = await fetch("http://localhost:5005/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetables, users })
      });
  
      const data = await res.json();
      setOptimized(data);
    } catch (err) {
      console.error("AI optimize error:", err);
    }
  };
  
  

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#f9f9f9' }}>
      <h1 style={{ marginBottom: '20px' }}>🛠️ Welcome, Admin!</h1>
      <button onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
      }} style={{ marginBottom: '30px', padding: '8px 14px', borderRadius: '5px', backgroundColor: '#333', color: 'white', border: 'none' }}>Logout</button>

      <h2>👥 All Users</h2>
      <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '6px', marginBottom: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} />
      <div style={{ background: '#fff', borderRadius: '8px', padding: '10px', marginBottom: '30px', boxShadow: '0 0 5px rgba(0,0,0,0.1)', maxHeight: '350px', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#ececec' }}>
            <tr>
              <th style={{ padding: '8px' }}>Name</th>
              <th style={{ padding: '8px' }}>Email</th>
              <th style={{ padding: '8px' }}>Role</th>
              <th style={{ padding: '8px' }}>User ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, 10).map(user => (
              <tr key={user._id}>
                <td style={{ padding: '8px' }}>{user.name}</td>
                <td style={{ padding: '8px' }}>{user.email}</td>
                <td style={{ padding: '8px' }}>{user.role}</td>
                <td style={{ padding: '8px' }}>{user._id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <h3>📚 Create New Course</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
            type="text"
            placeholder="Course name"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
            onClick={handleCreateCourse}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none' }}
        >
            ➕ Add Course
        </button>
        </div>


      <h3>🗓️ Create Timetable Slot</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select onChange={e => setCourseId(e.target.value)} value={courseId}>
          <option value="">Select Course</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <select onChange={e => setProfessorId(e.target.value)} value={professorId}>
          <option value="">Select Professor</option>
          {professors.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <select onChange={e => setDay(e.target.value)} value={day}>
          <option value="">Select Day</option>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select onChange={e => setTime(e.target.value)} value={time}>
          <option value="">Select Time</option>
          {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={handleCreateTimetable} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}>Save Schedule</button>
      </div>

      <h3>📋 All Timetables</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', borderRadius: '6px', boxShadow: '0 0 6px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#ececec' }}>
          <tr>
            <th style={{ padding: '10px' }}>Course</th>
            <th style={{ padding: '10px' }}>Professor</th>
            <th style={{ padding: '10px' }}>Day</th>
            <th style={{ padding: '10px' }}>Time</th>
            <th style={{ padding: '10px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map(t => (
            <tr key={t._id}>
              <td style={{ padding: '10px' }}>{t.course?.name || "Unknown"}</td>
              <td style={{ padding: '10px' }}>{t.professor?.name || "Unknown"}</td>
              <td style={{ padding: '10px' }}>{t.schedule?.day || "—"}</td>
              <td style={{ padding: '10px' }}>{t.schedule?.time || "—"}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleDeleteTimetable(t._id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>🗑 Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>📊 Visual Schedule</h3>
      <button
  onClick={handleOptimize}
  style={{ margin: '20px 0', backgroundColor: '#6a0dad', color: 'white', padding: '10px', borderRadius: '5px' }}
>
  🧠 Run AI Optimization
</button>

        <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <select onChange={e => setCourseId(e.target.value)} value={courseId}>
            <option value="">All Courses</option>
            {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
            ))}
        </select>

        <select onChange={e => setProfessorId(e.target.value)} value={professorId}>
            <option value="">All Professors</option>
            {professors.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
            ))}
        </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", border: "1px solid #ccc" }}>
        {}
        <div></div>
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
            <div key={day} style={{ padding: "5px", textAlign: "center", fontWeight: "bold", background: "#f1f1f1" }}>{day}</div>
        ))}

        {}
        {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(hour => (
            <React.Fragment key={hour}>
            <div style={{ padding: "5px", fontWeight: "bold", background: "#fafafa", borderTop: "1px solid #ccc" }}>{hour}</div>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                const slot = timetables.find(t =>
                t.schedule.day === day &&
                t.schedule.time === hour &&
                (!professorId || t.professor?._id === professorId) &&
                (!courseId || t.course?._id === courseId)
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
        {/* */}
      {optimized.length > 0 && (
        <>
          <h3>🤖 Optimized Visual Schedule</h3>
          <div style={{ display: "grid", gridTemplateColumns: "100px repeat(5, 1fr)", border: "1px solid #ccc" }}>
            <div></div>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
              <div key={day} style={{ padding: "5px", textAlign: "center", fontWeight: "bold", background: "#f1f1f1" }}>{day}</div>
            ))}
            {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(hour => (
              <React.Fragment key={hour}>
                <div style={{ padding: "5px", fontWeight: "bold", background: "#fafafa", borderTop: "1px solid #ccc" }}>{hour}</div>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                  const slot = optimized.find(t => t.schedule.day === day && t.schedule.time === hour);
                  return (
                    <div key={day + hour} style={{
                      minHeight: "40px",
                      borderTop: "1px solid #ccc",
                      borderLeft: "1px solid #ccc",
                      backgroundColor: slot ? getColorForCourse(slot.courseId) : "#fff",
                      padding: "5px",
                      fontSize: "14px"
                    }}>
                      {slot ? slot.courseName || "Course" : ""}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}