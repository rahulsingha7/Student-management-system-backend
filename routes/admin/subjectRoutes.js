const express = require("express");
const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../../controllers/admin/subjectController");

const router = express.Router();

router.post("/", createSubject);
router.get("/", getSubjects);
router.get("/:id", getSubjectById);  // Route for fetching a subject by ID
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
