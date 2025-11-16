const express = require("express");
const {
  createSemester,
  getSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
} = require("../../controllers/admin/semesterController");

const router = express.Router();

router.post("/", createSemester);
router.get("/", getSemesters);
router.get("/:id", getSemesterById);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

module.exports = router;
