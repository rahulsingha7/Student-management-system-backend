const mongoose = require("mongoose");
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const Result = require("../../models/teacher/Result");
const Student = require("../../models/student/Student");
const Session = require("../../models/admin/Session");
const Subject = require("../../models/admin/Subject");
const Teacher = require("../../models/teacher/Teacher");
exports.getResultsForAdmin = async (req, res) => {
  const { sessionId } = req.query;

  try {
    // Fetch approved enrollments for the selected session
    const enrollments = await StudentEnrollment.find({
      "subjects.session": sessionId,
      "subjects.status": "approved",
    })
      .populate("student")
      .populate("subjects.session");

    if (!enrollments.length) {
      return res.status(200).json({
        message: "No approved enrollments found for the selected session.",
      });
    }

    // Map to fetch results and calculate GPA
    const studentResults = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.student._id;
        const results = await Result.find({
          studentId,
          session: sessionId,
        });

        // Calculate GPA
        const totalGradePoints = results.reduce(
          (sum, result) => sum + parseFloat(result.grade || 0),
          0
        );
        const gpa =
          results.length > 0
            ? (totalGradePoints / results.length).toFixed(2)
            : "N/A";

        return {
          studentId: enrollment.student._id,
          studentId1: enrollment.student.studentId,
          studentName: enrollment.student.name,
          session: enrollment.subjects[0].session.name,
          gpa,
        };
        // console.log(StuddentId, studentId1);
      })
    );

    res.status(200).json(studentResults);
  } catch (error) {
    console.error("Error fetching results for admin:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.getStudentGradeDetails = async (req, res) => {
  const { studentId, sessionId } = req.params;
  console.log("Request Params:", { studentId, sessionId });

  try {
    // Query results for the specific student and session
    // Backend: Debug the session
    console.log("Session ID received:", sessionId);

    // Query for grades with session matching
    const grades = await Result.find({
      studentId,
      session: sessionId,
    })
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("studentId", "name studentId")
      .populate("teacherId", "name")
      .populate("session", "name");

    // Debug log
    console.log("Fetched Grades:", grades);

    // If no results, return a 404 with a message
    if (!grades.length) {
      return res.status(404).json({
        message: "No grades found for this student in the selected session.",
      });
    }

    const student = await Student.findById(studentId);
    console.log("Student Details:", student);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const totalGradePoints = grades.reduce(
      (sum, grade) => sum + parseFloat(grade.grade || 0),
      0
    );
    const gpa = grades.length
      ? (totalGradePoints / grades.length).toFixed(2)
      : "N/A";

    // Return the student's grade details for the session
    res.status(200).json({
      studentId: student._id.toString(),
      studentId1: student.studentId,
      studentName: student.name,
      session: grades[0].session.name,
      gpa,
      grades,
    });
  } catch (error) {
    console.error("Error in getStudentGradeDetails:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  const { gradeId } = req.params;

  try {
    // Find and delete the grade by its ID
    const result = await Result.findByIdAndDelete(gradeId);

    if (!result) {
      return res.status(404).json({ message: "Grade not found." });
    }

    res.status(200).json({ message: "Grade deleted successfully." });
  } catch (error) {
    console.error("Error in deleteGrade:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
// Fetch grade by gradeId
exports.getGradeById = async (req, res) => {
  const { gradeId } = req.params; // Use params instead of query for dynamic URLs

  if (!gradeId) {
    return res.status(400).json({ error: "gradeId is required" });
  }

  try {
    const grade = await Result.findById(gradeId).populate({
      path: "studentId",
      select: "name studentId", // Adjust to match your schema
    });

    if (!grade) {
      return res.status(404).json({ error: "Grade not found" });
    }

    const response = {
      attendance: grade.attendance,
      assignment: grade.assignment,
      ctMarks: grade.ctMarks,
      midTerm: grade.midTerm,
      finalExam: grade.finalExam,
      studentName: grade.studentId?.name || "N/A",
      studentId1: grade.studentId?.studentId || "N/A",
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching grade:", error);
    res.status(500).json({ error: "Failed to fetch grade" });
  }
};
// Update grade by gradeId
exports.updateGrade = async (req, res) => {
  const { gradeId, attendance, assignment, ctMarks, midTerm, finalExam } =
    req.body;

  if (!gradeId) {
    return res.status(400).json({ error: "gradeId is required" });
  }

  try {
    const totalMarks =
      (attendance || 0) +
      (assignment || 0) +
      (ctMarks || 0) +
      (midTerm || 0) +
      (finalExam || 0);

    // Logic for calculating letter grade and GPA
    let letterGrade = "F";
    let grade = 0.0;

    if (totalMarks >= 80 && totalMarks <= 100) {
      letterGrade = "A+";
      grade = 4.0;
    } else if (totalMarks >= 75 && totalMarks < 80) {
      letterGrade = "A";
      grade = 3.75;
    } else if (totalMarks >= 70 && totalMarks < 75) {
      letterGrade = "A-";
      grade = 3.5;
    } else if (totalMarks >= 65 && totalMarks < 70) {
      letterGrade = "B+";
      grade = 3.25;
    } else if (totalMarks >= 60 && totalMarks < 65) {
      letterGrade = "B";
      grade = 3.0;
    } else if (totalMarks >= 55 && totalMarks < 60) {
      letterGrade = "C+";
      grade = 2.75;
    } else if (totalMarks >= 50 && totalMarks < 55) {
      letterGrade = "C";
      grade = 2.5;
    } else if (totalMarks >= 40 && totalMarks < 50) {
      letterGrade = "D";
      grade = 2.0;
    } else {
      letterGrade = "F";
      grade = 0.0;
    }

    const updatedGrade = await Result.findByIdAndUpdate(
      gradeId, // Use gradeId instead of resultId
      {
        attendance,
        assignment,
        ctMarks,
        midTerm,
        finalExam,
        totalMarks,
        letterGrade,
        grade,
      },
      { new: true } // Return the updated document
    );

    if (!updatedGrade) {
      return res.status(404).json({ error: "Grade not found" });
    }

    res.json({ message: "Grade updated successfully", updatedGrade });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ error: "Failed to update grade" });
  }
};
exports.getOverallResults = async (req, res) => {
  try {
    // Fetch approved enrollments (students with approved subjects)
    const enrollments = await StudentEnrollment.find({
      "subjects.status": "approved",
    })
      .populate("student") // Populate student details
      .populate("subjects.session"); // Populate subject session

    if (!enrollments.length) {
      return res.status(200).json({
        message: "No approved enrollments found.",
      });
    }

    // Map to fetch results and calculate GPA
    const studentResults = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.student._id;
        const results = await Result.find({
          studentId,
        });

        // Calculate overall GPA
        const totalGradePoints = results.reduce(
          (sum, result) => sum + parseFloat(result.grade || 0),
          0
        );
        const overallGpa =
          results.length > 0
            ? (totalGradePoints / results.length).toFixed(2)
            : "N/A";

        return {
          studentId: enrollment.student._id.toString(),
          studentId1: enrollment.student.studentId,
          studentName: enrollment.student.name,
          overallGpa,
        };
      })
    );

    res.status(200).json(studentResults);
    console.log(studentResults);
  } catch (error) {
    console.error("Error fetching overall results:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getSemesterWiseResult = async (req, res) => {
  const { studentId } = req.params; // This is the ObjectId in URL

  try {
    // Fetch student details by studentId (assuming it's an ObjectId)
    const student = await Student.findOne({ _id: studentId }); // Use _id directly as ObjectId
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Fetch all grades for the student using their _id (ObjectId)
    const grades = await Result.find({
      studentId: student._id,
    })
      .populate("subject", "courseCode courseTitle ") // Ensure semester is populated
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

      const gradePoint = parseFloat(grade.grade || 0);
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
    console.error("Error in getSemesterWiseResult:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
