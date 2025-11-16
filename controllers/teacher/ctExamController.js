// controllers/teacher/ctExamController.js
const mongoose = require("mongoose");
const CTExam = require("../../models/teacher/CTExam");
const CTExamMarks = require("../../models/teacher/CTExamMarks");
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const Student = require("../../models/student/Student");
// Get CT exams with students and marks
// Create a new CT exam
exports.createCTExam = async (req, res) => {
  const {
    teacherId,
    ctName,
    examDate,
    duration,
    subject,
    semester,
    session,
    section,
  } = req.body;

  try {
    const newCTExam = new CTExam({
      teacherId,
      ctName,
      examDate,
      duration,
      subject,
      semester,
      session,
      section,
    });
    await newCTExam.save();
    res
      .status(201)
      .json({ message: "CT Exam created successfully", ctExam: newCTExam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all CT exams
// Get all CT exams for the logged-in teacher
exports.getCTExams = async (req, res) => {
  const { teacherId, sessionId } = req.query; // Add sessionId filter

  try {
    const filter = {
      ...(teacherId && { teacherId }),
      ...(sessionId && { session: sessionId }),
    }; // Filter by teacherId and sessionId if provided
    const ctExams = await CTExam.find(filter)
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("section", "section")
      .populate("teacherId", "name teacherId");
    res.status(200).json(ctExams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific CT exam by ID
exports.getCTExamById = async (req, res) => {
  try {
    const ctExam = await CTExam.findById(req.params.id)
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("section", "section")
      .populate("teacherId", "name teacherId");
    if (!ctExam) {
      return res.status(404).json({ message: "CT Exam not found" });
    }
    res.status(200).json(ctExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a CT exam by ID
exports.updateCTExam = async (req, res) => {
  const {
    teacherId,
    ctName,
    examDate,
    duration,
    subject,
    semester,
    session,
    section,
  } = req.body;

  try {
    const updatedCTExam = await CTExam.findByIdAndUpdate(
      req.params.id,
      {
        teacherId,
        ctName,
        examDate,
        duration,
        subject,
        semester,
        session,
        section,
      },
      { new: true }
    );
    if (!updatedCTExam) {
      return res.status(404).json({ message: "CT Exam not found" });
    }
    res
      .status(200)
      .json({ message: "CT Exam updated successfully", ctExam: updatedCTExam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a CT exam by ID
exports.deleteCTExam = async (req, res) => {
  try {
    const deletedCTExam = await CTExam.findByIdAndDelete(req.params.id);
    if (!deletedCTExam) {
      return res.status(404).json({ message: "CT Exam not found" });
    }
    res.status(200).json({ message: "CT Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCTExamsWithMarks = async (req, res) => {
  const { teacherId, sessionId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required" });
  }

  try {
    const filter = { teacherId };
    if (sessionId) {
      filter["session"] = sessionId; // Filter by session if provided
    }

    const ctExams = await CTExam.find(filter)
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("session", "name");

    const result = await Promise.all(
      ctExams.map(async (exam) => {
        const students = await StudentEnrollment.find({
          "subjects.semester": exam.semester,
          "subjects.section": exam.section,
          "subjects.status": "approved", // Only approved students
        })
          .populate("student", "studentId name")
          .populate("subjects.subject", "courseCode courseTitle")
          .populate("subjects.section", "section")
          .populate("subjects.semester", "semester")
          .populate("subjects.session", "name");

        const marks = await CTExamMarks.find({ ctExamId: exam._id });

        const studentMarks = students.map((enrollment) => {
          const markEntry = marks.find(
            (mark) =>
              mark.studentId.toString() === enrollment.student._id.toString()
          );

          return {
            studentId: enrollment.student._id,
            studentId1: enrollment.student.studentId,
            studentName: enrollment.student.name,
            marks: markEntry ? markEntry.marks : "Not given",
            markId: markEntry ? markEntry._id : null,
          };
        });

        return {
          ctExamId: exam._id,
          ctName: exam.ctName,
          semester: exam.semester.semester,
          section: exam.section.section,
          session: exam.session.name,
          courseCode: exam.subject.courseCode,
          courseTitle: exam.subject.courseTitle,
          students: studentMarks,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save marks for a student
exports.saveCTExamMarks = async (req, res) => {
  const { ctExamId, studentId, marks } = req.body;
  console.log("ctId", ctExamId);
  console.log("sId", studentId);
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(ctExamId)) {
    return res.status(400).json({ message: "Invalid CT Exam ID format" });
  }
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid Student ID format" });
  }

  try {
    // Validate `ctExamId`
    const ctExamExists = await CTExam.exists({ _id: ctExamId });
    if (!ctExamExists) {
      return res.status(400).json({ message: "Invalid CT Exam ID" });
    }

    // Validate `studentId`
    const studentExists = await Student.exists({ _id: studentId });
    if (!studentExists) {
      return res.status(400).json({ message: "Invalid Student ID" });
    }

    // Create and save the new marks entry
    const newMarks = new CTExamMarks({ ctExamId, studentId, marks });
    await newMarks.save();
    res
      .status(201)
      .json({ message: "Marks saved successfully", marks: newMarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update marks for a student
exports.updateCTExamMarks = async (req, res) => {
  const { markId } = req.params;
  const { marks } = req.body;

  try {
    const markExists = await CTExamMarks.exists({ _id: markId });
    if (!markExists) {
      return res.status(404).json({ message: "Marks not found" });
    }

    const updatedMarks = await CTExamMarks.findByIdAndUpdate(
      markId,
      { marks },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Marks updated successfully", marks: updatedMarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete marks for a student
exports.deleteCTExamMarks = async (req, res) => {
  const { markId } = req.params;

  try {
    const deletedMarks = await CTExamMarks.findByIdAndDelete(markId);
    if (!deletedMarks)
      return res.status(404).json({ message: "Marks not found" });

    res.status(200).json({ message: "Marks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
