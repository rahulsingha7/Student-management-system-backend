const express = require("express");
const {
  createCTExam, // Ensure this and other functions are defined in the controller
  getCTExams,
  getCTExamById,
  updateCTExam,
  deleteCTExam,
  getCTExamsWithMarks,
  saveCTExamMarks,
  updateCTExamMarks,
  deleteCTExamMarks,
} = require("../../controllers/teacher/ctExamController");
const teacherController = require("../../controllers/teacher/teacherController");
const router = express.Router();

// Define routes with controller functions
router.get("/", getCTExams); // GET route to retrieve all CT exams
router.get("/list", teacherController.getTeacherList);
router.get("/with-marks", getCTExamsWithMarks); // Get CT exams and student marks

router.get("/:id", getCTExamById); // GET route for a single CT exam by ID

router.post("/marks", saveCTExamMarks); // Add marks
router.post("/", createCTExam); // POST route for creating a CT exam

router.put("/marks/:markId", updateCTExamMarks); // Update marks
router.put("/:id", updateCTExam); // PUT route for updating a CT exam

router.delete("/marks/:markId", deleteCTExamMarks); // Delete marks
router.delete("/:id", deleteCTExam); // DELETE route for deleting a CT exam

module.exports = router;
