const mongoose = require("mongoose");

const ctExamMarksSchema = new mongoose.Schema(
  {
    ctExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CTExam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    marks: {
      type: Number,
      default: null, // Default to null (marks not given)
    },
  },
  { timestamps: true }
);

ctExamMarksSchema.index({ ctExamId: 1, studentId: 1 }, { unique: true });

const CTExamMarks = mongoose.model("CTExamMarks", ctExamMarksSchema);
module.exports = CTExamMarks;
