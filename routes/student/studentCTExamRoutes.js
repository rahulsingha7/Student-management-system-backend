const express = require("express");
const router = express.Router();
const {
  getCTExamsForStudent,
  getCTExamMarksForStudent,
} = require("../../controllers/student/ctExamControllerStudent");

router.get("/ct-exams", getCTExamsForStudent);
router.get("/marks", getCTExamMarksForStudent);
module.exports = router;
