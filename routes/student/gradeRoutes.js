// routes/student/grades.js
const express = require("express");
const router = express.Router();
const gradeController = require("../../controllers/student/gradeController");


router.get("/results-by-semester/:studentId", gradeController.getResultsBySemester);
router.get("/:studentId", gradeController.getStudentGrades);
router.get("/details/:gradeId", gradeController.getGradeDetails);


module.exports = router;
