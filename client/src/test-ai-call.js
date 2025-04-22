// test-ai-call.js
async function callAIOptimizer() {
    const token = localStorage.getItem("token");
  
    try {
      const [timetablesRes, usersRes] = await Promise.all([
        fetch("http://localhost:5001/api/v1/timetables", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json()),
        fetch("http://localhost:5001/api/v1/users", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json())
      ]);
  
      const response = await fetch("http://localhost:5005/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          timetables: timetablesRes,
          users: usersRes
        })
      });
  
      const result = await response.json();
      console.log("🤖 AI optimized result:", result);
    } catch (err) {
      console.error("❌ Ошибка при вызове AI:", err);
    }
  }
  
  callAIOptimizer(); // вызываем сразу
  