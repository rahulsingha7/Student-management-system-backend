// controllers/teacher/assignmentController.js
const Assignment = require("../../models/teacher/Assignment");
const AssignmentSubmission = require("../../models/student/AssignmentSubmission");
const StudentEnrollment = require("../../models/student/StudentEnrollment"); // Add if not imported
const Subject = require("../../models/admin/Subject");
// Create Assignment
exports.createAssignment = async (req, res) => {
  const {
    title,
    description,
    dueDate,
    courseCode,
    courseTitle,
    semester,
    section,
    session,
    teacherId, // Get teacherId from request body
  } = req.body;

  const assignment = new Assignment({
    teacherId, // Use the teacherId from the request body
    title,
    description,
    dueDate,
    courseCode,
    courseTitle,
    semester,
    section,
    session,
  });

  try {
    await assignment.save();
    res
      .status(201)
      .json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch Assignments for the logged-in teacher
exports.getAssignments = async (req, res) => {
  const { sessionId } = req.query; // Get sessionId from query parameters

  try {
    // Fetch assignments for the selected session
    const assignments = await Assignment.find({
      session: sessionId, // Filter assignments by session
    }).populate("semester section session");

    if (assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignments found for the selected session." });
    }

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a specific Assignment by ID
exports.getAssignmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findById(id).populate(
      "semester section session"
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Assignment
exports.updateAssignment = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    dueDate,
    courseCode,
    courseTitle,
    semester,
    section,
    session,
  } = req.body;

  try {
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      {
        title,
        description,
        dueDate,
        courseCode,
        courseTitle,
        semester,
        section,
        session,
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Assignment
exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// controllers/teacher/assignmentController.js

// controllers/assignmentController.js

exports.getAllAssignmentsWithSubmission = async (req, res) => {
  const { teacherId, sessionId } = req.query; // Teacher ID and Session ID

  try {
    // Fetch assignments created by the teacher for the selected session
    const assignments = await Assignment.find({
      teacherId: teacherId,
      session: sessionId,
    }).populate("semester section session");

    if (assignments.length === 0) {
      return res.status(200).json({
        assignments: [],
        message:
          "No assignments created by this teacher in the selected session.",
      });
    }

    // Fetch all students enrolled in the relevant subjects, sections, etc.
    const allStudentEnrollments = await StudentEnrollment.find({
      "subjects.semester": {
        $in: assignments.map((assignment) => assignment.semester),
      },
      "subjects.section": {
        $in: assignments.map((assignment) => assignment.section),
      },
      "subjects.session": {
        $in: assignments.map((assignment) => assignment.session),
      },
      "subjects.status": "approved", // Filter to only approved enrollments
    }).populate("student");

    // Process each assignment with submission details
    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await Promise.all(
          allStudentEnrollments.map(async (enrollment) => {
            const submission = await AssignmentSubmission.findOne({
              studentId: enrollment.student._id,
              assignmentId: assignment._id,
            });

            return {
              studentId: enrollment.student.studentId,
              studentName: enrollment.student.name,
              semester: assignment.semester.semester,
              section: assignment.section.section,
              courseCode: assignment.courseCode,
              courseTitle: assignment.courseTitle,
              title: assignment.title,
              dueDate: assignment.dueDate,
              submittedAt: submission
                ? submission.submittedAt
                : "Not submitted yet",
              marks: submission?.marks || "Not graded yet",
              feedback: submission?.feedback || "No feedback yet",
              file: submission?.file || null,
              submissionId: submission?._id || null,
            };
          })
        );
        return {
          assignmentTitle: assignment.title,
          submissions: submissions,
        };
      })
    );

    res.status(200).json({
      assignments: assignmentsWithSubmissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch submission details
exports.getSubmissionById = async (req, res) => {
  const { submissionId } = req.params;
  console.log("Si:", submissionId);
  try {
    const submission = await AssignmentSubmission.findById(submissionId)
      .populate({
        path: "assignmentId",
        populate: [
          { path: "semester", select: "semester" },
          { path: "section", select: "section" },
        ],
      })
      .populate("studentId", "studentId name");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json({
      studentId: submission.studentId.studentId,
      studentName: submission.studentId.name,
      semester: submission.assignmentId.semester,
      section: submission.assignmentId.section,
      courseCode: submission.assignmentId.courseCode,
      courseTitle: submission.assignmentId.courseTitle,
      title: submission.assignmentId.title,
      marks: submission.marks || "Not provided yet",
      feedback: submission.feedback || "Not provided yet",
    });
    console.log("submission", submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Grade a submission (update marks and feedback)
exports.gradeAssignmentSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { marks, feedback } = req.body;

  try {
    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Update marks and feedback
    submission.marks = marks || submission.marks;
    submission.feedback = feedback || submission.feedback;

    await submission.save();

    res
      .status(200)
      .json({ message: "Marks and feedback updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
