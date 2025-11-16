const express = require("express");
const router = express.Router();
const studentScheduleController = require("../../controllers/student/studentScheduleController");

// Route for viewing student class schedule
router.get(
  "/class-schedule/:studentId",
  studentScheduleController.viewClassSchedule
);

module.exports = router;
