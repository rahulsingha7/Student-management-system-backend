// routes/teacher/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const assignmentController = require("../../controllers/teacher/assignmentController");

// Create Assignment
router.post("/", assignmentController.createAssignment);

// Get Assignments
router.get("/", assignmentController.getAssignments);

router.get(
  "/submissions",
  assignmentController.getAllAssignmentsWithSubmission
);
// Fetch a specific submission by ID
router.get(
  "/submissions/:submissionId",
  assignmentController.getSubmissionById
);

// Update submission marks and feedback
router.put(
  "/submissions/:submissionId",
  assignmentController.gradeAssignmentSubmission
);
router.get("/:id", assignmentController.getAssignmentById);
// Update Assignment
router.put("/:id", assignmentController.updateAssignment);

// Delete Assignment
router.delete("/:id", assignmentController.deleteAssignment);

module.exports = router;
