const Result = require("../../models/teacher/Result");
const Student = require("../../models/student/Student");

exports.getStudentGrades = async (req, res) => {
  const { studentId } = req.params;
  const { sessionId } = req.query;

  try {
    // Fetch student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Fetch grades for the student by session
    const grades = await Result.find({
      studentId: studentId,
      session: sessionId,
    })
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("session", "name")
      .exec();

    if (grades.length === 0) {
      return res
        .status(404)
        .json({ message: "No grades found for the selected session." });
    }

    // Calculate GPA (make sure totalGradePoints is safely computed)
    const totalGradePoints = grades.reduce(
      (acc, grade) => acc + parseFloat(grade.grade), // Parse as float
      0
    );
    const gpa =
      grades.length > 0 ? (totalGradePoints / grades.length).toFixed(2) : 0;

    res.status(200).json({
      student,
      grades,
      gpa, // GPA rounded to 2 decimal places
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getGradeDetails = async (req, res) => {
  const { gradeId } = req.params;

  try {
    const grade = await Result.findById(gradeId)
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("session", "name")
      .populate("studentId", "name studentId") // Populate student's name and ID
      .exec();

    if (!grade) {
      return res.status(404).json({ message: "Grade not found." });
    }

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResultsBySemester = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Fetch student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Fetch all grades for the student
    const grades = await Result.find({ studentId })
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("studentId", "name studentId")
      .exec();

    if (grades.length === 0) {
      return res
        .status(404)
        .json({ message: "No grades found for this student." });
    }

    // Group results by semester
    const groupedResults = grades.reduce((acc, grade) => {
      const semester = grade.semester.semester;
      if (!acc[semester]) {
        acc[semester] = {
          semester,
          grades: [],
          totalGradePoints: 0,
          courseCount: 0,
        };
      }

      const gradePoint = parseFloat(grade.grade);
      acc[semester].grades.push(grade);
      acc[semester].totalGradePoints += gradePoint;
      acc[semester].courseCount++;

      return acc;
    }, {});

    // Calculate GPA per semester and overall GPA
    let totalGradePoints = 0;
    let totalCourses = 0;

    Object.values(groupedResults).forEach((semesterData) => {
      semesterData.semesterGpa = (
        semesterData.totalGradePoints / semesterData.courseCount
      ).toFixed(2);
      totalGradePoints += semesterData.totalGradePoints;
      totalCourses += semesterData.courseCount;
    });

    const overallGpa = (totalGradePoints / totalCourses).toFixed(2);

    res.status(200).json({
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
      },
      overallGpa,
      semesters: Object.values(groupedResults),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
