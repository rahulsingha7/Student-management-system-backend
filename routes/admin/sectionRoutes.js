const express = require("express");
const {
  createSection,
  getSections,
  getSectionById,
  updateSection,
  deleteSection,
} = require("../../controllers/admin/sectionController");

const router = express.Router();

router.post("/", createSection); // Create a new section
router.get("/", getSections); // Get all sections
// In sessionRoutes.js (or a similar routes file)
router.get("/:id", getSectionById);
router.put("/:id", updateSection); // Update a section
router.delete("/:id", deleteSection); // Delete a section

module.exports = router;
