// controllers/student/enrollmentController.js
const StudentEnrollment = require("../../models/student/StudentEnrollment");
const Subject = require("../../models/admin/Subject");
const Section = require("../../models/admin/Section");
const Student = require("../../models/student/Student"); // Import Student model

// Get all available subjects with related session, semester, and sections
exports.getAvailableSubjects = async (req, res) => {
  try {
    // Fetch all subjects with populated session and semester data
    const subjects = await Subject.find()
      .populate("semester", "semester")
      .populate("session", "name")
      .exec();

    // Fetch sections separately and map them with subjects
    const sections = await Section.find().populate("semester session").exec();

    // Combine subjects with their available sections
    const subjectsWithSections = subjects.map((subject) => ({
      ...subject.toObject(),
      sections: sections
        .filter(
          (section) =>
            section.semester.equals(subject.semester._id) &&
            section.session.equals(subject.session._id)
        )
        .map((section) => ({
          _id: section._id,
          section: section.section,
        })),
    }));

    res.status(200).json(subjectsWithSections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enroll in subjects
// Enroll in subjects
exports.enrollSubjects = async (req, res) => {
  const { studentId, selectedSubjects } = req.body;

  try {
    // Find or create enrollment for the student
    let enrollment = await StudentEnrollment.findOne({ student: studentId });

    if (enrollment) {
      // Filter out subjects that are already enrolled
      const newSubjects = selectedSubjects.filter((subject) => {
        return !enrollment.subjects.some(
          (enrolledSubject) =>
            enrolledSubject.subject.toString() === subject.subjectId &&
            enrolledSubject.section.toString() === subject.sectionId
        );
      });

      if (newSubjects.length === 0) {
        return res
          .status(400)
          .json({ message: "All selected subjects are already enrolled." });
      }

      // Add the new subjects to the existing enrollment
      enrollment.subjects.push(
        ...newSubjects.map((subject) => ({
          subject: subject.subjectId,
          section: subject.sectionId,
          semester: subject.semesterId,
          session: subject.sessionId,
          status: "pending",
        }))
      );

      await enrollment.save();
      res.status(200).json({ message: "Enrollment updated successfully." });
    } else {
      // Create a new enrollment document if one doesn't exist
      const newEnrollment = new StudentEnrollment({
        student: studentId,
        subjects: selectedSubjects.map((subject) => ({
          subject: subject.subjectId,
          section: subject.sectionId,
          semester: subject.semesterId,
          session: subject.sessionId,
          status: "pending",
        })),
      });

      await newEnrollment.save();
      res.status(201).json({ message: "Enrollment created successfully." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get enrolled subjects for a student
// Get enrolled subjects for a student with pagination
const mongoose = require("mongoose");

exports.getEnrolledSubjects = async (req, res) => {
  const { studentId } = req.params;
  const { sessionId } = req.query;

  try {
    // Build query filters
    const query = {
      student: studentId,
      ...(sessionId && {
        subjects: {
          $elemMatch: { session: new mongoose.Types.ObjectId(sessionId) },
        },
      }),
    };

    console.log("Query:", JSON.stringify(query, null, 2)); // Debugging

    const enrollment = await StudentEnrollment.findOne(query)
      .populate("student", "name studentId email")
      .populate("subjects.subject", "courseCode courseTitle")
      .populate("subjects.section", "section")
      .populate("subjects.semester", "semester")
      .populate("subjects.session", "name")
      .lean();

    if (!enrollment || !enrollment.subjects.length) {
      return res.status(404).json({
        message: "No enrollments found for this student.",
      });
    }

    // If sessionId is provided, filter subjects by sessionId
    const subjects = sessionId
      ? enrollment.subjects.filter(
          (subject) => subject.session._id.toString() === sessionId.toString()
        )
      : enrollment.subjects;

    res.status(200).json({ subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a pending subject from enrollment
exports.deletePendingSubject = async (req, res) => {
  const { studentId, subjectId, sectionId } = req.body;

  try {
    const enrollment = await StudentEnrollment.findOne({ student: studentId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    // Find the subject-section pair and check if it is pending
    const subject = enrollment.subjects.find(
      (subj) =>
        subj.subject.toString() === subjectId &&
        subj.section.toString() === sectionId &&
        subj.status === "pending"
    );
    if (!subject) {
      return res
        .status(400)
        .json({ message: "Subject is either not found or already approved." });
    }

    // Remove the subject-section pair
    enrollment.subjects = enrollment.subjects.filter(
      (subj) =>
        !(
          subj.subject.toString() === subjectId &&
          subj.section.toString() === sectionId
        )
    );
    await enrollment.save();

    res.status(200).json({ message: "Pending subject removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
