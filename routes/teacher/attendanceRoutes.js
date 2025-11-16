const express = require("express");
const router = express.Router();
const {
  getStudentsForAttendance,
  markAttendance,
  getAttendanceRecords,
  updateAttendanceRecord,
} = require("../../controllers/teacher/attendanceController");

// Fetch students under a teacher's schedule for marking attendance
router.get("/students", getStudentsForAttendance);
// Get attendance records
router.get("/view", getAttendanceRecords);
// Mark attendance for a class session
router.post("/mark", markAttendance);

// Update attendance record
router.put("/update/:id", updateAttendanceRecord);
// Search attendance records
// router.get("/search", searchAttendance);

module.exports = router;