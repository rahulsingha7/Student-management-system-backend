// routes/student/enrollmentRoutes.js
const express = require("express");
const router = express.Router();
const enrollmentController = require("../../controllers/student/enrollmentController");

router.get("/available-subjects", enrollmentController.getAvailableSubjects);
router.post("/enroll", enrollmentController.enrollSubjects);
router.get(
  "/enrolled-subjects/:studentId",
  enrollmentController.getEnrolledSubjects
);
router.delete("/delete-subject", enrollmentController.deletePendingSubject);

module.exports = router;
