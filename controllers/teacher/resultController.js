const mongoose = require("mongoose");
const TeacherSchedule = require("../../models/admin/TeacherSchedule");
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const Result = require("../../models/teacher/Result");

exports.getResultsForTeacher = async (req, res) => {
  const teacherId = req.query.teacherId;

  try {
    // Fetch all the teacher's schedules for subjects, sections, semesters, and sessions
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

    // Find student enrollments based on teacher's schedules
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
      "subjects.session": {
        $in: teacherSchedules.map((schedule) => schedule.session._id),
      },
      "subjects.status": "approved",
    })
      .populate("student")
      .populate("subjects.subject")
      .populate("subjects.section")
      .populate("subjects.semester")
      .populate("subjects.session");

    if (enrollments.length === 0) {
      return res
        .status(200)
        .json({ message: "No students found for grading." });
    }

    // Group students' results by subject, semester, section, and session
    const groupedResults = enrollments.flatMap((enrollment) =>
      enrollment.subjects
        .filter((subject) =>
          teacherSchedules.some(
            (schedule) =>
              schedule.subject._id.equals(subject.subject._id) &&
              schedule.section._id.equals(subject.section._id) &&
              schedule.semester._id.equals(subject.semester._id) &&
              schedule.session._id.equals(subject.session._id) &&
              schedule.session._id.equals(req.query.sessionId) // Explicitly filter by session
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
          semesterId: subject.semester._id.toString(),
          sectionId: subject.section._id.toString(),
          totalMarks: "Not Marked Yet",
          letterGrade: "Not Marked Yet",
          grade: "Not Graded Yet",
          session: subject.session.name,
        }))
    );

    // Fetch existing results
    const resultData = await Result.find({
      teacherId,
      subject: { $in: groupedResults.map((result) => result.subjectId) },
      semester: { $in: groupedResults.map((result) => result.semesterId) },
      section: { $in: groupedResults.map((result) => result.sectionId) },
    });

    groupedResults.forEach((result) => {
      console.log("Processing result:", result);
      const existingResult = resultData.find(
        (r) =>
          r.studentId?.toString() === result.studentId &&
          r.subject?.toString() === result.subjectId &&
          r.semester?.toString() === result.semesterId &&
          r.section?.toString() === result.sectionId
      );
      console.log("Existing result found:", existingResult);

      if (existingResult) {
        result.totalMarks = existingResult.totalMarks || "Not Marked Yet";
        result.letterGrade = existingResult.letterGrade || "Not Marked Yet";
        result.grade = existingResult.grade || "Not Graded Yet";
      }
    });

    // Group results by a composite key
    const groupedResultsByKey = groupedResults.reduce((acc, result) => {
      const groupKey = `${result.semester}-${result.section}-${result.session}-${result.courseCode}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(result);
      return acc;
    }, {});

    res.status(200).json(groupedResultsByKey);
  } catch (error) {
    console.error("Error fetching results for teacher:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// controllers/teacher/resultController.js

exports.gradeStudent = async (req, res) => {
  const {
    studentId,
    teacherId,
    subjectId,
    semesterId,
    sectionId,
    sessionId,
    attendance,
    assignment,
    ctMarks,
    midTerm,
    finalExam,
  } = req.body;

  try {
    // Calculate total marks
    const totalMarks = attendance + assignment + ctMarks + midTerm + finalExam;

    // Determine letter grade and grade point
    let letterGrade = "F";
    let gradePoint = 0.0;

    if (totalMarks >= 80) {
      letterGrade = "A+";
      gradePoint = 4.0;
    } else if (totalMarks >= 75 && totalMarks < 80) {
      letterGrade = "A";
      gradePoint = 3.75;
    } else if (totalMarks >= 70 && totalMarks < 75) {
      letterGrade = "A-";
      gradePoint = 3.5;
    } else if (totalMarks >= 65 && totalMarks < 70) {
      letterGrade = "B+";
      gradePoint = 3.25;
    } else if (totalMarks >= 60 && totalMarks < 65) {
      letterGrade = "B";
      gradePoint = 3.0;
    } else if (totalMarks >= 55 && totalMarks < 60) {
      letterGrade = "C+";
      gradePoint = 2.75;
    } else if (totalMarks >= 50 && totalMarks < 55) {
      letterGrade = "C";
      gradePoint = 2.5;
    } else if (totalMarks >= 40 && totalMarks < 50) {
      letterGrade = "D";
      gradePoint = 2.0;
    } else {
      letterGrade = "F";
      gradePoint = 0.0;
    }

    // Save or update the result
    const result = await Result.findOneAndUpdate(
      {
        studentId,
        teacherId,
        subject: subjectId,
        semester: semesterId,
        section: sectionId,
        session: sessionId,
      },
      {
        teacherId,
        studentId,
        subject: subjectId,
        semester: semesterId,
        section: sectionId,
        session: sessionId,
        attendance,
        assignment,
        ctMarks,
        midTerm,
        finalExam,
        totalMarks,
        letterGrade,
        grade: gradePoint,
      },
      { new: true, upsert: true } // Create if not exists
    );

    res.status(200).json({ message: "Grade submitted successfully.", result });
  } catch (error) {
    console.error("Error grading student:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.viewGrades = async (req, res) => {
  const { teacherId, studentId, subjectId } = req.query;

  try {
    // Query includes filtering by subjectId
    const query = { teacherId, studentId };
    if (subjectId) {
      query.subject = subjectId;
    }

    const results = await Result.find(query)
      .populate("subject", "courseCode courseTitle")
      .populate("semester", "semester")
      .populate("section", "section")
      .populate("session", "name");

    if (results.length === 0) {
      return res.status(200).json({ message: "No grades found." });
    }

    const formattedResults = results.map((result) => ({
      attendance: result.attendance || "N/A",
      assignment: result.assignment || "N/A",
      ctMarks: result.ctMarks || "N/A",
      midTerm: result.midTerm || "N/A",
      finalExam: result.finalExam || "N/A",
      totalMarks: result.totalMarks || "Not Graded Yet",
      letterGrade: result.letterGrade || "Not Graded Yet",
      courseCode: result.subject?.courseCode || "Unknown",
      courseTitle: result.subject?.courseTitle || "Unknown",
      semester: result.semester?.semester || "Unknown",
      section: result.section?.section || "Unknown",
      session: result.session?.name || "Unknown",
      resultId: result._id,
    }));

    console.log("Formatted Results:", formattedResults);

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  const { resultId } = req.body;

  try {
    await Result.findByIdAndDelete(resultId);
    res.status(200).json({ message: "Grade deleted successfully." });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.getGradeById = async (req, res) => {
  const { resultId } = req.query;

  if (!resultId) {
    return res.status(400).json({ error: "resultId is required" });
  }

  try {
    const grade = await Result.findById(resultId).populate({
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

// Update grade by resultId
exports.updateGrade = async (req, res) => {
  const { resultId, attendance, assignment, ctMarks, midTerm, finalExam } =
    req.body;

  if (!resultId) {
    return res.status(400).json({ error: "resultId is required" });
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

    if (totalMarks >= 80) {
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
      resultId,
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
