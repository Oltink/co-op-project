const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
    const { name, email, password, role, department } = req.body;
    console.log("Register route hit!");
    console.log("Incoming request body:", req.body);
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        user = new User({ 
            name, 
            email, 
            password: await bcrypt.hash(password, 10), 
            role, 
            department 
        });
        await user.save();

        res.json({ msg: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// User login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            msg: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});


// Get all users (Admin only)
router.get("/", protect, authorize("admin"), async (req, res) => {
    try {
        const users = await User.find({}, "-password"); 
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Admin-only data access
router.get("/admin-data", protect, authorize("admin"), (req, res) => {
    res.json({ message: "Admin access only!" });
});

// Scheduler-only data access
router.get("/scheduler-data", protect, authorize("scheduler"), (req, res) => {
    res.json({ message: "Scheduler access only!" });
});

// Professor-only data access
router.get("/professor-data", protect, authorize("professor"), (req, res) => {
    res.json({ message: "Professor access only!" });
});

// Student-only data access
router.get("/student-data", protect, authorize("student"), (req, res) => {
    res.json({ message: "Student access only!" });
});

module.exports = router;
