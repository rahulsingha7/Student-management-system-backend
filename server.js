const express = require("express");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin/adminRoutes");
const teacherRoutes = require("./routes/teacher/teacherRoutes");
const studentRoutes = require("./routes/student/studentRoutes");
const sessionRoutes = require("./routes/admin/sessionRoutes");
const semesterRoutes = require("./routes/admin/semesterRoutes");
const sectionRoutes = require("./routes/admin/sectionRoutes");
const subjectRoutes = require("./routes/admin/subjectRoutes");
const enrollRoutes = require("./routes/admin/enrollRoutes");
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const ctExamRoutes = require("./routes/teacher/ctExamRoutes");
const teacherScheduleRoutes = require("./routes/admin/teacherScheduleRoutes"); // Add this line()
const statisticsRoutes = require("./routes/admin/statisticsRoutes");
const assignmentRoutes = require("./routes/teacher/assignmentRoutes");
const enrollmentRoutes = require("./routes/student/enrollmentRoutes");
const studentScheduleRoutes = require("./routes/student/studentScheduleRoutes");
const studentAssignmentRoutes = require("./routes/student/studentAssignmentRoutes");
const teacherAttendanceRoutes = require("./routes/teacher/attendanceRoutes");
const studentCTExamRoutes = require("./routes/student/studentCTExamRoutes");
const studentAttendanceRoutes = require("./routes/student/studentAttendanceRoutes");
const resultRoutes = require("./routes/teacher/resultRoutes");
const gradeRoutes = require("./routes/student/gradeRoutes");
const adminResultRoutes = require("./routes/admin/adminResultRoutes");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
app.use(cors());
const path = require("path");
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Use routes
//Admin routes

app.use("/admin/results", adminResultRoutes); // Authentication routes for Admin
app.use("/admin/auth", adminAuthRoutes); // Authentication routes for Admin
app.use("/admin/sessions", sessionRoutes);
app.use("/admin/semesters", semesterRoutes);
app.use("/admin/sections", sectionRoutes);
app.use("/admin/subjects", subjectRoutes);
app.use("/admin/teacher-schedule", teacherScheduleRoutes);
app.use("/admin/statistics", statisticsRoutes);
app.use("/admin/enroll", enrollRoutes);
app.use("/admin", adminRoutes);

//Teacher Routes
app.use("/teacher/results", resultRoutes);
app.use("/teacher/ct-exams", ctExamRoutes);
app.use("/teacher/attendance", teacherAttendanceRoutes);
app.use("/teacher/assignments", assignmentRoutes);
app.use("/teacher", teacherRoutes);

//Student Routes

app.use("/student/grade", gradeRoutes);
app.use("/student/exam", studentCTExamRoutes);
app.use("/student/attendance", studentAttendanceRoutes);
app.use("/student/enrollment", enrollmentRoutes);
app.use("/student/schedule", studentScheduleRoutes);
app.use("/student/assignments", studentAssignmentRoutes);
app.use("/student", studentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
