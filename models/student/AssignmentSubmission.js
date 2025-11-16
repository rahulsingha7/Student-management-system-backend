// models/student/AssignmentSubmission.js
const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Assuming you have a Student model
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment", // Reference to Assignment model
      required: true,
    },
    file: {
      type: String, // Path to the uploaded file (PDF)
      required: true,
    },
    filename: {
      type: String, // Original filename of the uploaded PDF
      required: true,
    },
    submittedAt: {
      type: Date, // Date when the assignment was submitted
      default: Date.now,
    },
    marks: {
      type: Number, // Marks awarded by the teacher
      default: null, // Null initially until graded
    },
    gradedAt: {
      type: Date, // Date when the assignment was graded
      default: null,
    },
    feedback: {
      type: String, // Feedback from the teacher (optional)
      default: null,
    },
  },
  { timestamps: true }
);

const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);

module.exports = AssignmentSubmission;
