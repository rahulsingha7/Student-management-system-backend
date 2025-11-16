const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
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
});

// Create a compound index to enforce uniqueness of courseCode within the same semester and session
SubjectSchema.index(
  { courseCode: 1, courseTitle: 1,
     semester: 1, session: 1 },
  { unique: true }
);

module.exports = mongoose.model("Subject", SubjectSchema);
