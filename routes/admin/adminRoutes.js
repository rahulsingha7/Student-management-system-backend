const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');

router.get("/list", adminController.getAdminList);
router.put("/edit/:id", adminController.updateAdmin);
// backend/routes/admin.js
router.get("/:id", adminController.getAdminById);

router.delete("/delete/:id", adminController.deleteAdmin);

// Additional admin routes can be added here
// e.g., router.post('/create-semester', adminController.createSemester);

module.exports = router;
