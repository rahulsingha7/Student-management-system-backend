// controllers/student/assignmentController.js
const Assignment = require("../../models/teacher/Assignment");
const Student = require("../../models/student/Student"); // Assuming you have a Student model
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const AssignmentSubmission = require("../../models/student/AssignmentSubmission"); // Create this model
const path = require("path");
const fs = require("fs").promises;
exports.getAssignmentsForStudent = async (req, res) => {
  const { studentId, sessionId } = req.query;

  try {
    const enrollment = await StudentEnrollment.findOne({ student: studentId });
    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "No enrollments found for this student." });
    }

    const approvedSubjects = enrollment.subjects.filter(
      (subject) =>
        subject.status === "approved" &&
        subject.session.toString() === sessionId
    );

    if (approvedSubjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No approved enrollments for this session." });
    }

    const approvedCombinations = approvedSubjects.map((subject) => ({
      semester: subject.semester,
      section: subject.section,
      session: subject.session,
    }));

    const conditions = {
      $or: approvedCombinations.map((combo) => ({
        semester: combo.semester,
        section: combo.section,
        session: combo.session,
      })),
    };

    const assignments = await Assignment.find(conditions).populate(
      "semester section session teacherId"
    );

    const assignmentsWithSubmission = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await AssignmentSubmission.findOne({
          studentId,
          assignmentId: assignment._id,
        });
        return {
          ...assignment.toObject(),
          isSubmitted: !!submission,
        };
      })
    );

    res.status(200).json({
      assignments: assignmentsWithSubmission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitAssignment = async (req, res) => {
  const { assignmentId, studentId } = req.body;
  const file = req.file;

  try {
    // Check if the assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // Check if submission already exists
    const existingSubmission = await AssignmentSubmission.findOne({
      studentId,
      assignmentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        message:
          "You have already submitted this assignment. Delete your previous submission to upload again.",
      });
    }

    // Check due date
    const dueDate = new Date(assignment.dueDate);
    const currentDate = new Date();
    if (currentDate > dueDate) {
      return res.status(400).json({
        message: "Assignment submission period has passed.",
      });
    }

    // Create a new submission
    const newSubmission = new AssignmentSubmission({
      studentId,
      assignmentId,
      file: file.path,
      filename: file.originalname,
      submittedAt: new Date(),
    });

    await newSubmission.save();
    res.status(200).json({
      message: "Assignment submitted successfully!",
      submission: newSubmission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSubmission = async (req, res) => {
  const { submissionId } = req.params;
  console.log("Deleting submission with ID:", submissionId);

  try {
    const submission = await AssignmentSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    // Ensure the file exists before attempting deletion
    const filePath = path.resolve(submission.file);
    console.log("Deleting file at:", filePath);

    // First, delete the submission from the database (using deleteOne)
    await AssignmentSubmission.deleteOne({ _id: submissionId });

    // Now, delete the file from the file system
    await fs.unlink(filePath); // Wait for the file to be deleted

    res
      .status(200)
      .json({ message: "Submission and file deleted successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.viewSubmittedAssignment = async (req, res) => {
  const { studentId } = req.params;
  const { sessionId } = req.query; // Accept sessionId as a query parameter

  try {
    const submissions = await AssignmentSubmission.find({ studentId })
      .populate({
        path: "assignmentId",
        model: "Assignment",
        select: "title dueDate courseCode courseTitle session",
        populate: {
          path: "session",
          model: "Session", // Adjust if your session model is named differently
          select: "name",
        },
      })
      .lean();

    // Filter submissions based on sessionId if provided
    const filteredSubmissions = sessionId
      ? submissions.filter(
          (submission) =>
            submission.assignmentId.session._id.toString() === sessionId
        )
      : submissions;

    const submissionsWithAssignment = filteredSubmissions.map((submission) => ({
      ...submission,
      assignment: submission.assignmentId,
      assignmentId: undefined,
    }));

    res.status(200).json({
      submissions: submissionsWithAssignment,
    });
  } catch (error) {
    console.error("Error fetching submitted assignments:", error.message);
    res.status(500).json({ message: "Failed to fetch submitted assignments." });
  }
};
