const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const studentGroupRoutes = require("./routes/studentGroupRoutes");
const { protect } = require("./middleware/authMiddleware");

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/v1/users", authRoutes);
console.log("Auth routes loaded at /api/v1/users");
console.log(authRoutes.stack.map(r => r.route ? r.route.path : "Middleware"));
app.use("/api/v1/courses", protect, courseRoutes);
app.use("/api/v1/timetables", protect, timetableRoutes);
app.use("/api/v1/student-groups", protect, studentGroupRoutes);


// Example protected route
app.get("/api/protected", protect, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.get("/", (req, res) => {
    res.json({ message: "API is running..." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("Connecting to MongoDB:", process.env.MONGO_URI);
