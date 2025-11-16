const Semester = require("../../models/admin/Semester");

// Create a new semester
exports.createSemester = async (req, res) => {
  const { semester } = req.body;

  try {
    const existingSemester = await Semester.findOne({ semester });
    if (existingSemester) {
      return res.status(400).json({ message: "Semester already exists!" });
    }

    const newSemester = new Semester({ semester });
    await newSemester.save();
    res.status(201).json({
      message: "Semester created successfully!",
      semester: newSemester,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all semesters
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find();
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a semester by ID
exports.getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: "Semester not found!" });
    }
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a semester
exports.updateSemester = async (req, res) => {
  const { semester } = req.body;
  try {
    const existingSemester = await Semester.findOne({ semester });
    if (existingSemester) {
      return res.status(400).json({ message: "Semester already exists!" });
    }
    const updatedSemester = await Semester.findByIdAndUpdate(
      req.params.id,
      { semester },
      { new: true }
    );
    if (!updatedSemester) {
      return res.status(404).json({ message: "Semester not found!" });
    }
    res.status(200).json({
      message: "Semester updated successfully!",
      semester: updatedSemester,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a semester
exports.deleteSemester = async (req, res) => {
  try {
    const deletedSemester = await Semester.findByIdAndDelete(req.params.id);
    if (!deletedSemester) {
      return res.status(404).json({ message: "Semester not found!" });
    }
    res.status(200).json({ message: "Semester deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
