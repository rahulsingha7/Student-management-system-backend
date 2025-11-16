const express = require("express");
const router = express.Router();
const {
  getResultsForTeacher,
  gradeStudent,
  viewGrades,
  deleteGrade,
  getGradeById,
  updateGrade,
} = require("../../controllers/teacher/resultController");
// Route to fetch grade by resultId
router.get("/edit-grade", getGradeById);
// Fetch results for a teacher
router.get("/view-grades", viewGrades);
router.get("/", getResultsForTeacher);
router.post("/update-grade", updateGrade);
router.post("/grade-student", gradeStudent);
// Route to view grades for a specific student

// Route to delete a grade
router.delete("/delete-grade", deleteGrade);
module.exports = router;
