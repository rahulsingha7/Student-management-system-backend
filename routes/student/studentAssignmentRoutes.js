// routes/student/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const assignmentController = require("../../controllers/student/studentAssignmentController");
const upload = require("../../middleware/upload");
// Get Assignments for Student
router.get("/", assignmentController.getAssignmentsForStudent);
// Route to submit assignment
router.post(
  "/submit",
  upload.single("assignmentFile"), // Handle the file upload
  assignmentController.submitAssignment
);
// router.get("/view/:studentId/:assignmentId", assignmentController.viewSubmittedAssignment);
router.get(
  "/submitted/:studentId",
  assignmentController.viewSubmittedAssignment
);
// Route to delete assignment submission
// routes/student/assignmentRoutes.js
router.delete("/delete/:submissionId", assignmentController.deleteSubmission);
module.exports = router;
