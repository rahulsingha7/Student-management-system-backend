// routes/admin/teacherScheduleRoutes.js
const express = require("express");
const router = express.Router();
const teacherScheduleController = require("../../controllers/admin/teacherScheduleController");
const teacherController = require("../../controllers/teacher/teacherController");

// Route to get all teacher schedules
router.get("/", teacherScheduleController.getAllTeacherSchedules);
router.get("/list", teacherController.getTeacherList);
// Route to get a single teacher's schedule for a specific session
router.get("/single-teacher-schedule", teacherScheduleController.getSingleTeacherSchedule);

// Route to create a new teacher schedule
router.get(
  "/subjects/session/:sessionId",
  teacherScheduleController.getSubjectsBySession
);
router.get(
  "/sections/semester/:semesterId/session/:sessionId",
  teacherScheduleController.getSectionsBySemesterAndSession
);
router.post("/", teacherScheduleController.createTeacherSchedule);

// Route to get a specific teacher schedule by ID
router.get("/:id", teacherScheduleController.getTeacherScheduleById);

// Route to update a teacher schedule by ID
router.put("/:id", teacherScheduleController.updateTeacherSchedule);

// Route to delete a teacher schedule by ID
router.delete("/:id", teacherScheduleController.deleteTeacherSchedule);

module.exports = router;
