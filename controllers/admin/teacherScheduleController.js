const mongoose = require("mongoose");
const TeacherSchedule = require("../../models/admin/TeacherSchedule");
const Teacher = require("../../models/teacher/Teacher");
const Section = require("../../models/admin/Section"); // Assuming this import
const Subject = require("../../models/admin/Subject"); // Assuming this import
exports.getSubjectsBySession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Fetching subjects by sessionId, ensuring to populate the semester field
    const subjects = await Subject.find({ session: sessionId })
      .populate("semester") // Populating the semester reference field
      .populate("session"); // Optionally populate session, if needed
    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this session." });
    }
    res.status(200).json(subjects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching subjects for the session." });
  }
};

exports.getSectionsBySemesterAndSession = async (req, res) => {
  const { semesterId, sessionId } = req.params;
  try {
    const sections = await Section.find({
      semester: semesterId,
      session: sessionId,
    });
    if (sections.length === 0) {
      return res
        .status(404)
        .json({ message: "No sections found for this semester and session." });
    }
    res.status(200).json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching sections." });
  }
};

exports.createTeacherSchedule = async (req, res) => {
  const {
    teacherId,
    semester,
    session,
    section,
    day,
    startTime,
    endTime,
    subject,
  } = req.body;

  try {
    // Step 1: Check if the teacher already has a conflicting schedule
    const teacherScheduleConflict = await TeacherSchedule.findOne({
      teacherId,
      session,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (teacherScheduleConflict) {
      return res.status(400).json({
        message: `Teacher already has a schedule for ${day} between ${teacherScheduleConflict.startTime} and ${teacherScheduleConflict.endTime}.`,
      });
    }

    // Step 2: Check if another teacher is already scheduled for the same course and section on the same day and time
    const sectionScheduleConflict = await TeacherSchedule.findOne({
      session,
      section,
      subject,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (sectionScheduleConflict) {
      return res.status(400).json({
        message: `Another teacher is already scheduled between ${sectionScheduleConflict.startTime} and ${sectionScheduleConflict.endTime}.`,
      });
    }

    // Step 3: Check if the course and section are already scheduled on the same day
    const duplicateCourseConflict = await TeacherSchedule.findOne({
      session,
      section,
      subject,
      day,
    });

    if (duplicateCourseConflict) {
      return res.status(400).json({
        message: `The course is already scheduled on ${day}. It cannot be scheduled again on the same day.`,
      });
    }

    // Step 4: Check if the section already has a conflicting class at the same time
    const sectionTimeConflict = await TeacherSchedule.findOne({
      session,
      section,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (sectionTimeConflict) {
      return res.status(400).json({
        message: `Already has a class scheduled on ${day} between ${sectionTimeConflict.startTime} and ${sectionTimeConflict.endTime}.`,
      });
    }

    // If no conflicts, create the new teacher schedule
    const newSchedule = new TeacherSchedule({
      teacherId,
      semester,
      session,
      section,
      day,
      startTime,
      endTime,
      subject,
    });

    await newSchedule.save();

    res.status(201).json({
      message: "Teacher schedule created successfully.",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get all teacher schedules
// Get all teacher schedules
exports.getAllTeacherSchedules = async (req, res) => {
  const { teacherId, semester, session, section, subject, day, search } =
    req.query;
  const filter = {};

  // Filter by teacher ID if provided and valid
  if (teacherId && mongoose.isValidObjectId(teacherId)) {
    filter.teacherId = new mongoose.Types.ObjectId(teacherId);
  }
  if (semester) filter.semester = semester;
  if (session) filter.session = session; // Filter by session
  if (section) filter.section = section;
  if (subject) filter.subject = subject;
  if (day) filter.day = day;

  // Search by teacher's name
  if (search) {
    const teacherFilter = await Teacher.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    filter.teacherId = { $in: teacherFilter.map((teacher) => teacher._id) };
  }

  try {
    const schedules = await TeacherSchedule.find(filter)
      .populate("teacherId", "name teacherId")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("section", "section")
      .populate("subject", "courseCode courseTitle");

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get teacher schedule by ID
exports.getTeacherScheduleById = async (req, res) => {
  try {
    const schedule = await TeacherSchedule.findById(req.params.id)
      .populate("teacherId", "name teacherId")
      .populate("semester", "name")
      .populate("session", "name")
      .populate("section", "name")
      .populate("subject", "courseCode courseTitle");

    if (!schedule)
      return res.status(404).json({ message: "Schedule not found." });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Update a teacher schedule
// Update a teacher schedule
exports.updateTeacherSchedule = async (req, res) => {
  const {
    teacherId,
    semester,
    session,
    section,
    day,
    startTime,
    endTime,
    subject,
  } = req.body;

  try {
    // Step 1: Check if the teacher already has a conflicting schedule
    const teacherScheduleConflict = await TeacherSchedule.findOne({
      teacherId,
      session,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (teacherScheduleConflict) {
      return res.status(400).json({
        message: `Teacher already has a schedule for ${day} between ${teacherScheduleConflict.startTime} and ${teacherScheduleConflict.endTime}.`,
      });
    }

    // Step 2: Check if another teacher is already scheduled for the same course and section on the same day and time
    const sectionScheduleConflict = await TeacherSchedule.findOne({
      session,
      section,
      subject,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (sectionScheduleConflict) {
      return res.status(400).json({
        message: `Another teacher is already scheduled between ${sectionScheduleConflict.startTime} and ${sectionScheduleConflict.endTime}.`,
      });
    }

    // Step 3: Check if the course and section are already scheduled on the same day
    const duplicateCourseConflict = await TeacherSchedule.findOne({
      session,
      section,
      subject,
      day,
    });

    if (duplicateCourseConflict) {
      return res.status(400).json({
        message: `The course is already scheduled on ${day}. It cannot be scheduled again on the same day.`,
      });
    }

    // Step 4: Check if the section already has a conflicting class at the same time
    const sectionTimeConflict = await TeacherSchedule.findOne({
      session,
      section,
      day,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping time
      ],
    });

    if (sectionTimeConflict) {
      return res.status(400).json({
        message: `Already has a class scheduled on ${day} between ${sectionTimeConflict.startTime} and ${sectionTimeConflict.endTime}.`,
      });
    }

    // If no conflicts, update the teacher schedule
    const updatedSchedule = await TeacherSchedule.findByIdAndUpdate(
      req.params.id,
      {
        teacherId,
        semester,
        session,
        section,
        day,
        startTime,
        endTime,
        subject,
      },
      { new: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    res.status(200).json({
      message: "Teacher schedule updated successfully.",
      schedule: updatedSchedule,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
// Delete a teacher schedule
exports.deleteTeacherSchedule = async (req, res) => {
  try {
    const deletedSchedule = await TeacherSchedule.findByIdAndDelete(
      req.params.id
    );

    if (!deletedSchedule)
      return res.status(404).json({ message: "Schedule not found." });
    res.status(200).json({ message: "Teacher schedule deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
exports.getSingleTeacherSchedule = async (req, res) => {
  const { teacherId, sessionId } = req.query;

  // Validate required parameters
  if (!teacherId || !mongoose.isValidObjectId(teacherId)) {
    return res.status(400).json({ message: "Invalid or missing teacherId." });
  }
  if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
    return res.status(400).json({ message: "Invalid or missing sessionId." });
  }

  const filter = {
    teacherId: new mongoose.Types.ObjectId(teacherId),
    session: new mongoose.Types.ObjectId(sessionId),
  };

  try {
    const schedules = await TeacherSchedule.find(filter)
      .populate("teacherId", "name teacherId")
      .populate("semester", "semester")
      .populate("session", "name")
      .populate("section", "section")
      .populate("subject", "courseCode courseTitle");

    if (!schedules.length) {
      return res.status(404).json({ message: "No schedules found." });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
