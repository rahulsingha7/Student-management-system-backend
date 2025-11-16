const express = require("express");
const router = express.Router();
const teacherController = require("../../controllers/teacher/teacherController");

router.post("/register", teacherController.register);
router.post("/login", teacherController.login);
router.get("/list", teacherController.getTeacherList);
router.get("/:id", teacherController.getTeacherById);
router.put("/edit/:id", teacherController.updateTeacher);
router.delete("/delete/:id", teacherController.deleteTeacher);

module.exports = router;
