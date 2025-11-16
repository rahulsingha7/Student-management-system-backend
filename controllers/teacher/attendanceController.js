const mongoose = require("mongoose");
const Attendance = require("../../models/teacher/Attendance");
const TeacherSchedule = require("../../models/admin/TeacherSchedule");
const StudentEnrollment = require("../../models/student/StudentEnrollment");

exports.getStudentsForAttendance = async (req, res) => {
  const teacherId = req.query.teacherId;
  const sessionId = req.query.sessionId; // Get sessionId from the request

  try {
    const teacherSchedules = await TeacherSchedule.find({ teacherId })
      .populate("subject")
      .populate("section")
      .populate("semester")
      .populate("session");

    if (teacherSchedules.length === 0) {
      return res
        .status(200)
        .json({ message: "No subjects found for this teacher." });
    }

    const enrollments = await StudentEnrollment.find({
      "subjects.subject": {
        $in: teacherSchedules.map((schedule) => schedule.subject._id),
      },
      "subjects.semester": {
        $in: teacherSchedules.map((schedule) => schedule.semester._id),
      },
      "subjects.section": {
        $in: teacherSchedules.map((schedule) => schedule.section._id),
      },
      "subjects.status": "approved", // Ensure only approved enrollments are included
     "subjects.session": new mongoose.Types.ObjectId(sessionId), // Ensure sessionId is an exact match // Filter by selected session
    })
      .populate("student")
      .populate("subjects.subject")
      .populate("subjects.section")
      .populate("subjects.semester")
      .populate("subjects.session");

    if (enrollments.length === 0) {
      return res
        .status(200)
        .json({ message: "No students found for this teacher's subjects." });
    }

    const attendanceData = enrollments.flatMap((enrollment) =>
      enrollment.subjects
        .filter((subject) =>
          teacherSchedules.some(
            (schedule) =>
              schedule.subject._id.equals(subject.subject._id) &&
              schedule.section._id.equals(subject.section._id) &&
              schedule.semester._id.equals(subject.semester._id) &&
              schedule.session._id.equals(subject.session._id)
          )
        )
        .map((subject) => ({
          studentId: enrollment.student._id.toString(),
          studentId1: enrollment.student.studentId.toString(),
          studentName: enrollment.student.name,
          semester: subject.semester.semester,
          section: subject.section.section,
          courseCode: subject.subject.courseCode,
          courseTitle: subject.subject.courseTitle,
          subjectId: subject.subject._id.toString(),
          sessionId: subject.session._id.toString(),
          status: "Absent",
          session: subject.session.name,
          semesterId: subject.semester._id.toString(),
          sectionId: subject.section._id.toString(),
        }))
    );

    res.status(200).json(attendanceData);
  } catch (error) {
    console.error("Error fetching students for attendance:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const {
    date,
    teacherId,
    attendanceRecords,
    semester,
    section,
    session,
    subject,
  } = req.body;

  // Validate required fields
  if (
    !date ||
    !teacherId ||
    !attendanceRecords ||
    !semester ||
    !section ||
    !session ||
    !subject
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingAttendance = await Attendance.findOne({
      date,
      teacherId: new mongoose.Types.ObjectId(teacherId), // Corrected to use `new`
      semester: new mongoose.Types.ObjectId(semester), // Corrected to use `new`
      section: new mongoose.Types.ObjectId(section), // Corrected to use `new`
      session: new mongoose.Types.ObjectId(session), // Corrected to use `new`
      subject: new mongoose.Types.ObjectId(subject), // Corrected to use `new`
    });

    if (existingAttendance) {
      return res.status(409).json({
        message:
          "Attendance for this group has already been marked for the selected date.",
      });
    }

    // Convert studentIds to ObjectIds
    const convertedAttendanceRecords = attendanceRecords.map((record) => ({
      studentId: new mongoose.Types.ObjectId(record.studentId), // Corrected to use `new`
      status: record.status,
    }));

    // Create attendance documents
    const attendanceDoc = {
      date,
      teacherId: new mongoose.Types.ObjectId(teacherId), // Corrected to use `new`
      semester: new mongoose.Types.ObjectId(semester), // Corrected to use `new`
      section: new mongoose.Types.ObjectId(section), // Corrected to use `new`
      session: new mongoose.Types.ObjectId(session), // Corrected to use `new`
      subject: new mongoose.Types.ObjectId(subject), // Corrected to use `new`
      attendanceRecords: convertedAttendanceRecords,
    };

    await Attendance.create(attendanceDoc); // Save the attendance document
    res.status(201).json({ message: "Attendance marked successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.getAttendanceRecords = async (req, res) => {
  const teacherId = req.query.teacherId;
  const sessionId = req.query.sessionId; // Added sessionId filter

  try {
    // Fetch attendance records filtered by session and teacher
    const attendanceRecords = await Attendance.find({ teacherId, session: sessionId })
      .populate("subject", "courseCode courseTitle")
      .populate("section", "section")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("attendanceRecords.studentId", "studentId name");

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found for this session." });
    }

    const groupedData = attendanceRecords.reduce((acc, record) => {
      const groupKey = `${record.semester.semester}-${record.section.section}-${record.session.name}-${record.subject.courseCode}`;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push({
        _id: record._id,
        date: record.date,
        attendanceRecords: record.attendanceRecords.map((r) => ({
          studentId: r.studentId._id,
          studentId1: r.studentId.studentId,
          studentName: r.studentId.name,
          status: r.status,
          _id: r._id,
        })),
        courseTitle: record.subject.courseTitle,
      });
      return acc;
    }, {});

    res.status(200).json(groupedData);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.updateAttendanceRecord = async (req, res) => {
  const { id } = req.params; // Attendance document ID
  const { studentRecordId, status } = req.body; // Nested record ID and new status

  if (!id || !studentRecordId || !status) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the attendance document by its ID
    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Find the specific student record within the attendanceRecords array
    const record = attendance.attendanceRecords.id(studentRecordId);

    if (!record) {
      return res.status(404).json({ message: "Student attendance not found." });
    }

    // Update the status
    record.status = status;

    // Save the updated attendance document
    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
