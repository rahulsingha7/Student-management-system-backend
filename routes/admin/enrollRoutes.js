const express = require("express");
const enrollController = require("../../controllers/admin/enrollController");
const router = express.Router();

router.get("/enrollments", enrollController.getAllEnrollments);
router.put("/enrollment/status", enrollController.updateEnrollmentStatus);
router.put("/enrollment/approve-all", enrollController.approveAllEnrollments);

router.delete("/enrollment/delete", enrollController.deleteEnrollment); // New delete route
module.exports = router;
