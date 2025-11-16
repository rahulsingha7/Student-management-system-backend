// models/teacher/Result.js
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  attendance: { type: Number, min: 0, max: 10, default: 0 },
  assignment: { type: Number, min: 0, max: 10, default: 0 },
  ctMarks: { type: Number, min: 0, max: 20, default: 0 }, // Array to store multiple CT exam marks
  midTerm: { type: Number, min: 0, max: 20, default: 0 },
  finalExam: { type: Number, min: 0, max: 40, default: 0 },
  totalMarks: { type: Number, default: 0 },
  letterGrade: { type: String, default: "F" },
  grade: { type: String, default: "Not Graded Yet" }, // A placeholder for grading
});

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
