const Student = require("../../models/student/Student"); // Import your models
const Teacher = require("../../models/teacher/Teacher");
const Semester = require("../../models/admin/Semester");
const Section = require("../../models/admin/Section");
const Subject = require("../../models/admin/Subject");
const Session = require("../../models/admin/Session");
exports.getStatistics = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const teacherCount = await Teacher.countDocuments();
    const semesterCount = await Semester.countDocuments();
    const sectionCount = await Section.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const sessionCount = await Session.countDocuments();
    res.status(200).json({
      students: studentCount,
      teachers: teacherCount,
      semesters: semesterCount,
      sections: sectionCount,
      subjects: subjectCount,
      sessions: sessionCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
