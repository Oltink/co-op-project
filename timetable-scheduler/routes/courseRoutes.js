const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const Course = require("../models/Course");
const Timetable = require("../models/Timetable");
const User = require("../models/User");
const router = express.Router();

router.post("/create-course", protect, authorize("admin"), async (req, res) => {
    const { name, professors } = req.body;

    try {
        const course = new Course({ name, professors });
        await course.save();

        res.json({ msg: "Course created", course });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

router.post("/add-timetable", protect, authorize("admin"), async (req, res) => {
    const { courseId, professorId, schedule } = req.body;

    try {
        const timetable = new Timetable({ course: courseId, professor: professorId, schedule });
        await timetable.save();

        res.json({ msg: "Timetable created", timetable });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


router.post("/enroll", protect, authorize("student"), async (req, res) => {
    const { studentId, timetableId } = req.body;

    try {
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") return res.status(404).json({ msg: "Student not found" });

        student.enrolledCourses.push(timetableId);
        await student.save();

        res.json({ msg: "Student enrolled", student });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

router.post("/assign-student", protect, authorize("admin"), async (req, res) => {
    const { courseId, studentId } = req.body;
  
    try {
      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(404).json({ msg: "Student not found" });
      }
  
      if (!student.enrolledCourses.includes(courseId)) {
        student.enrolledCourses.push(courseId);
        await student.save();
      }
  
      res.json({ msg: "Student assigned to course", student });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  router.get("/", protect, authorize("admin"), async (req, res) => {
    try {
      const courses = await Course.find().populate("professors", "name email");
      res.json(courses);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  

module.exports = router;
