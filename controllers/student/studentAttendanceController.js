const Attendance = require("../../models/teacher/Attendance");
const StudentEnrollment = require("../../models/student/StudentEnrollment");

exports.getStudentAttendance = async (req, res) => {
  const studentId = req.query.studentId;
  const sessionId = req.query.sessionId; // Session ID passed as a query parameter
  const searchQuery = req.query.search || ""; // Optional search query

  try {
    const attendanceRecords = await Attendance.find({
      "attendanceRecords.studentId": studentId,
    })
      .populate("subject", "courseCode courseTitle")
      .populate("section", "section")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("attendanceRecords.studentId", "studentId name")
      .populate("teacherId", "name");

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    // Filter by sessionId if provided
    const filteredRecords = sessionId
      ? attendanceRecords.filter(
          (record) => record.session._id.toString() === sessionId
        )
      : attendanceRecords;

    // Filter by Course Code or Course Title if a search query is provided
    const searchedRecords = filteredRecords.filter((record) => {
      const { courseCode, courseTitle } = record.subject;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        courseCode.toLowerCase().includes(lowerQuery) ||
        courseTitle.toLowerCase().includes(lowerQuery)
      );
    });

    // Group records by semester, section, session, and course code
    const groupedData = searchedRecords.reduce((acc, record) => {
      const groupKey = `${record.semester.semester}-${record.section.section}-${record.session.name}-${record.subject.courseCode}`;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push({
        date: record.date,
        studentId: record.attendanceRecords.find((r) =>
          r.studentId._id.equals(studentId)
        ).studentId.studentId,
        studentName: record.attendanceRecords.find((r) =>
          r.studentId._id.equals(studentId)
        ).studentId.name,
        courseTitle: record.subject.courseTitle,
        attendance: record.attendanceRecords.find((r) =>
          r.studentId._id.equals(studentId)
        ).status,
        teacherName: record.teacherId.name,
      });
      return acc;
    }, {});

    res.status(200).json(groupedData);
  } catch (error) {
    console.error("Error fetching attendance records for student:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
