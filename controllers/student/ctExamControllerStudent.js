const CTExam = require("../../models/teacher/CTExam");
const CTExamMarks = require("../../models/teacher/CTExamMarks");
const Student = require("../../models/student/Student");
const StudentEnrollment = require("../../models/student/StudentEnrollment");

exports.getCTExamsForStudent = async (req, res) => {
  const { studentId, sessionId } = req.query; // Student ID and session ID from query parameters

  try {
    // Find the student's approved enrollments
    const enrollment = await StudentEnrollment.findOne({ student: studentId })
      .populate("subjects.subject", "courseCode courseTitle")
      .populate("subjects.semester", "semester")
      .populate("subjects.session", "name")
      .populate("subjects.section", "section");

    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "No enrollments found for this student." });
    }

    const approvedSubjects = enrollment.subjects.filter(
      (subject) => subject.status === "approved"
    );

    if (approvedSubjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved enrollments found for this student." });
    }

    // Build conditions to match CT exams, filtered by session if provided
    const conditions = {
      $or: approvedSubjects
        .filter(
          (subject) =>
            !sessionId || subject.session._id.toString() === sessionId
        )
        .map((subject) => ({
          subject: subject.subject._id,
          semester: subject.semester._id,
          session: subject.session._id,
          section: subject.section._id,
        })),
    };

    if (conditions.$or.length === 0) {
      return res
        .status(404)
        .json({ message: "No CT exams found for this session." });
    }

    // Fetch CT exams
    const ctExams = await CTExam.find(conditions)
      .populate("teacherId", "name")
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("section", "section");

    res.status(200).json({
      exams: ctExams,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCTExamMarksForStudent = async (req, res) => {
  const { studentId, sessionId } = req.query; // Logged-in student ID and selected session ID
  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Fetch all CTExamMarks for the student filtered by session
    const ctExamMarks = await CTExamMarks.find({
      studentId: studentId,
    }).populate({
      path: "ctExamId",
      match: sessionId ? { session: sessionId } : {}, // Filter by session if sessionId is provided
      populate: [
        { path: "subject", select: "courseCode courseTitle" },
        { path: "semester", select: "semester" },
        { path: "session", select: "name" },
        { path: "section", select: "section" },
        { path: "teacherId", select: "name" },
      ],
    });

    // Filter out any null ctExamId (cases where the session doesn't match)
    const filteredMarks = ctExamMarks.filter((mark) => mark.ctExamId);

    const marksData = filteredMarks.map((mark) => ({
      ctName: mark.ctExamId.ctName,
      session: mark.ctExamId.session.name,
      semester: mark.ctExamId.semester.semester,
      section: mark.ctExamId.section.section,
      courseCode: mark.ctExamId.subject.courseCode,
      courseTitle: mark.ctExamId.subject.courseTitle,
      teacher: mark.ctExamId.teacherId.name,
      marks: mark.marks ?? "Not provided yet", // Display "Not provided yet" if marks are null
    }));

    res.status(200).json({
      student: {
        id: student.studentId,
        name: student.name,
      },
      marks: marksData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
