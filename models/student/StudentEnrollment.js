// models/student/StudentEnrollment.js
const mongoose = require("mongoose");

const studentEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subjects: [
      {
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
        status: { type: String, default: "pending" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentEnrollment", studentEnrollmentSchema);
