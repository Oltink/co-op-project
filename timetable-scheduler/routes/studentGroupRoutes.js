const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const StudentGroup = require("../models/StudentGroup");
const User = require("../models/User");

const router = express.Router();

router.post("/create", protect, authorize("admin"), async (req, res) => {
    const { name } = req.body;

    try {
        const group = new StudentGroup({ name });
        await group.save();

        res.json({ msg: "Group created", group });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

router.post("/add-student", protect, authorize("admin"), async (req, res) => {
    const { studentId, groupId } = req.body;

    try {
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") return res.status(404).json({ msg: "Student not found" });

        const group = await StudentGroup.findById(groupId);
        if (!group) return res.status(404).json({ msg: "Group not found" });

        student.group = groupId;
        await student.save();

        group.students.push(studentId);
        await group.save();

        res.json({ msg: "Student added to group", group });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
