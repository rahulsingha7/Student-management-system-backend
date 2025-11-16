const StudentEnrollment = require("../../models/student/StudentEnrollment");
const TeacherSchedule = require("../../models/admin/TeacherSchedule");

// Controller for fetching student schedule
exports.viewClassSchedule = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { sessionId } = req.query; // Get sessionId from query parameters

    const enrollment = await StudentEnrollment.findOne({ student: studentId })
      .populate("subjects.subject", "courseCode courseTitle")
      .populate("subjects.section", "section")
      .populate("subjects.semester", "semester")
      .populate("subjects.session", "name");

    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "No enrollments found for this student." });
    }

    const enrolledSubjects = enrollment.subjects
      .filter(
        (subj) =>
          !sessionId || subj.session._id.toString() === sessionId.toString()
      )
      .map((subj) => ({
        subjectId: subj.subject._id,
        sectionId: subj.section._id,
        semesterId: subj.semester._id,
        sessionId: subj.session._id,
        status: subj.status, // Include the status of each subject
      }));

    const schedule = await TeacherSchedule.find({
      $or: enrolledSubjects.map(
        ({ subjectId, sectionId, semesterId, sessionId }) => ({
          subject: subjectId,
          section: sectionId,
          semester: semesterId,
          session: sessionId,
        })
      ),
    })
      .populate("teacherId", "name")
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("session", "name");

    const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
    const formattedSchedule = {};

    daysOfWeek.forEach((day) => {
      formattedSchedule[day] = [];
    });

    schedule.forEach((entry) => {
      const daySchedule = formattedSchedule[entry.day] || [];
    
      // Check for overlaps with existing entries
      daySchedule.forEach((classEntry) => {
        const isOverlap =
          (classEntry.startTime < entry.endTime &&
            classEntry.endTime > entry.startTime) ||
          (classEntry.startTime === entry.startTime &&
            classEntry.endTime === entry.endTime);
    
        if (isOverlap) {
          // Mark both the current entry and the overlapping entry
          classEntry.overlap = `${entry.subject.courseCode} - ${entry.subject.courseTitle} (Overlap)`;
          entry.overlap = `${classEntry.courseCode} - ${classEntry.courseTitle} (Overlap)`;
        }
      });
    
      // Add the current entry to the schedule
      daySchedule.push({
        session: entry.session.name,
        semester: entry.semester.semester,
        section: entry.section.section,
        courseCode: entry.subject.courseCode,
        courseTitle: entry.subject.courseTitle,
        teacher: entry.teacherId.name,
        startTime: entry.startTime,
        endTime: entry.endTime,
        status:
          enrolledSubjects.find(
            (subj) =>
              subj.subjectId.toString() === entry.subject._id.toString() &&
              subj.sectionId.toString() === entry.section._id.toString() &&
              subj.semesterId.toString() === entry.semester._id.toString() &&
              subj.sessionId.toString() === entry.session._id.toString()
          )?.status || "unknown",
        overlap: entry.overlap || null, // Include overlap information
      });
    
      formattedSchedule[entry.day] = daySchedule;
    });
    

    res.status(200).json({ schedule: formattedSchedule });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
