const Teacher = require("../../models/teacher/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Teacher
exports.register = async (req, res) => {
  const { name, teacherId, email, password } = req.body;

  try {
    const existingUser = await Teacher.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({
      name,
      teacherId,
      email,
      password: hashedPassword,
    });
    await newTeacher.save();
    res.status(201).json({ message: "Teacher registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Login Teacher
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: "Invalid Email." });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = jwt.sign(
      { id: teacher._id, role: teacher.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, teacher });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
// Fetch all teachers with search
// Fetch all teachers with search
exports.getTeacherList = async (req, res) => {
  const { search } = req.query;
  try {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { teacherId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const teachers = await Teacher.find(filter);
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a specific teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update teacher by ID
exports.updateTeacher = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If a new password is provided, hash it before updating
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete teacher by ID
exports.deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher)
      return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
