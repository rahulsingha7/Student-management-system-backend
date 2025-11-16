// backend/routes/student/studentRoutes.js

const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/student/studentController");

router.post("/register", studentController.register);
router.post("/login", studentController.login);
router.get("/list", studentController.getStudentList);
router.get("/:id", studentController.getStudentById);
router.put("/edit/:id", studentController.updateStudent);
router.delete("/delete/:id", studentController.deleteStudent);

module.exports = router;
