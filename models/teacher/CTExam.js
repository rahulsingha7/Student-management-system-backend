// models/teacher/CTExam.js
const mongoose = require("mongoose");

const ctExamSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    ctName: {
      type: String,
      required: true,
      enum: ["CT-1", "CT-2", "CT-3"], // Define specific CT names
    },
    examDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique exams per subject, CT name, and section
ctExamSchema.index({ subject: 1, ctName: 1, section: 1 }, { unique: true });

const CTExam = mongoose.model("CTExam", ctExamSchema);
module.exports = CTExam;
