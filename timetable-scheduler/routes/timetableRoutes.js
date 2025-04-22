const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const Timetable = require("../models/Timetable");

const router = express.Router();

router.get("/", protect, authorize("admin", "scheduler", "student"), async (req, res) => {

    try {
      const timetables = await Timetable.find()
        .populate("course", "name")
        .populate("professor", "name");
  
      res.json(timetables);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
  

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
    try {
        await Timetable.findByIdAndDelete(req.params.id);
        res.json({ msg: "Timetable deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Student enroll in a timetable slot
router.post("/enroll", protect, authorize("student"), async (req, res) => {
    const { timetableId } = req.body;
  
    try {
      const student = await require("../models/User").findById(req.user.id);
      if (!student) return res.status(404).json({ msg: "Student not found" });
  
      if (!student.enrolledCourses.includes(timetableId)) {
        student.enrolledCourses.push(timetableId);
        await student.save();
      }
  
      res.json({ msg: "Enrolled successfully", enrolledCourses: student.enrolledCourses });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
  router.post("/unenroll", protect, authorize("student"), async (req, res) => {
    const { timetableId } = req.body;
  
    try {
      const student = await require("../models/User").findById(req.user.id);
      if (!student) return res.status(404).json({ msg: "Student not found" });
  
      student.enrolledCourses = student.enrolledCourses.filter(id => id.toString() !== timetableId);
      await student.save();
  
      res.json({ msg: "Unenrolled successfully", enrolledCourses: student.enrolledCourses });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
  router.get("/:id/students", protect, authorize("admin"), async (req, res) => {
    try {
      const timetable = await Timetable.findById(req.params.id).populate("students", "name email");
      if (!timetable) return res.status(404).json({ msg: "Timetable not found" });
      res.json(timetable.students);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });

  router.post("/:id/remove-student", protect, authorize("admin"), async (req, res) => {
    const { studentId } = req.body;
  
    try {
      const timetable = await Timetable.findById(req.params.id);
      const student = await User.findById(studentId);
  
      if (!timetable || !student) return res.status(404).json({ msg: "Not found" });
  
      timetable.students = timetable.students.filter(id => id.toString() !== studentId);
      student.enrolledCourses = student.enrolledCourses.filter(id => id.toString() !== req.params.id);
  
      await timetable.save();
      await student.save();
  
      res.json({ msg: "Student removed from timetable" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
// GET all timetables for student
router.get("/timetables", protect, authorize("student"), async (req, res) => {
    try {
      const timetables = await Timetable.find()
        .populate("course", "name")
        .populate("professor", "name");
      res.json(timetables);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
  // routes/timetables.js
router.get("/professor/me", protect, authorize("professor"), async (req, res) => {
    try {
      const timetables = await Timetable.find({ professor: req.user.id })
        .populate("course", "name")
        .populate("professor", "name");
      res.json(timetables);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  });
  
module.exports = router;
