const express = require("express");
const router = express.Router();
const { getStudentAttendance } = require("../../controllers/student/studentAttendanceController");

// Fetch attendance records for a student
router.get("/", getStudentAttendance);

module.exports = router;
