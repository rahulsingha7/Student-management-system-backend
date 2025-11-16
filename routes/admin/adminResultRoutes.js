const express = require("express");
const router = express.Router();
const {
  getResultsForAdmin,
  getStudentGradeDetails,
  deleteGrade,
  getGradeById,
  updateGrade,
  getOverallResults,
  getSemesterWiseResult,
} = require("../../controllers/admin/adminResultController");

router.get("/student", getResultsForAdmin);
router.get("/overall-results", getOverallResults);
router.get("/semesterwise/:studentId", getSemesterWiseResult);

router.get("/details/:studentId/:sessionId", getStudentGradeDetails);
router.get("/edit-grade/:gradeId", getGradeById);
// Update grade by gradeId
router.post("/update-grade", updateGrade);

router.delete("/delete-grade/:gradeId", deleteGrade); // Define the delete route
module.exports = router;
