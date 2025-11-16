const express = require("express");
const router = express.Router();
const {
  createSession,
  getAllSessions,
  getSessionById,
  editSession,
  deleteSession,
} = require("../../controllers/admin/sessionController");

router.post("/", createSession);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.put("/:id", editSession);
router.delete("/:id", deleteSession);

module.exports = router;
