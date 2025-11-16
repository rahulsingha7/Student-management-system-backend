const mongoose = require("mongoose");
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const Student = require("../../models/student/Student");

exports.getAllEnrollments = async (req, res) => {
  try {
    const { search = "", sessionId } = req.query;

    // Query to find students based on search input
    const students = await Student.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ],
    });

    // Extract IDs of matched students
    const studentIds = students.map((student) => student._id);

    // Build the query for fetching enrollments
    const query = {
      student: { $in: studentIds },
    };

    // If sessionId is provided, add session filter to query
    if (sessionId) {
      query["subjects.session"] = new mongoose.Types.ObjectId(sessionId); // Ensure sessionId is an ObjectId
    }

    console.log("Query being executed:", JSON.stringify(query, null, 2)); // Debugging the query

    const enrollments = await StudentEnrollment.find(query)
      .populate("student", "name studentId email")
      .populate("subjects.subject", "courseCode courseTitle")
      .populate("subjects.section", "section")
      .populate("subjects.semester", "semester")
      .populate("subjects.session", "name")
      .lean(); // Use lean() to optimize performance (returns plain JavaScript objects)

    // If no enrollments found, return a 404
    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({
        message: "No enrollments found for the specified criteria.",
      });
    }

    // If sessionId is provided, filter the subjects for each enrollment by session
    if (sessionId) {
      // Filter subjects by sessionId if it's provided
      enrollments.forEach((enrollment) => {
        enrollment.subjects = enrollment.subjects.filter(
          (subject) => subject.session._id.toString() === sessionId.toString()
        );
      });
    }

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to update the enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
  const { enrollmentId, subjectId, sectionId, status } = req.body;
  console.log("Received data:", req.body);
  try {
    // Find the enrollment and update the specific subject's status
    const enrollment = await StudentEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const subject = enrollment.subjects.find(
      (subj) =>
        subj.subject.toString() === subjectId &&
        subj.section.toString() === sectionId
    );
    if (!subject) {
      return res
        .status(404)
        .json({ message: "Subject not found in enrollment" });
    }

    // Update the subject status
    subject.status = status;
    await enrollment.save();

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId, subjectId, sectionId } = req.body;

    // Use both subjectId and sectionId to match the specific enrollment
    await StudentEnrollment.updateOne(
      { _id: enrollmentId },
      { $pull: { subjects: { subject: subjectId, section: sectionId } } }
    );

    res.status(200).json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.approveAllEnrollments = async (req, res) => {
  const { sessionId } = req.body;

  try {
    // Update the status of subjects only for the specified session
    await StudentEnrollment.updateMany(
      { "subjects.session": sessionId },
      { $set: { "subjects.$[subject].status": "approved" } },
      {
        arrayFilters: [{ "subject.session": sessionId }], // Filter to ensure only the matching session is updated
        multi: true, // Ensure all matching documents are updated
      }
    );

    res.status(200).json({ message: "All enrollments approved successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
