// backend/controllers/student/studentController.js

const Student = require("../../models/student/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Student
exports.register = async (req, res) => {
  const { name, studentId, email, password } = req.body;

  try {
    const existingUser = await Student.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Student({
      name,
      studentId,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Student registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Login Student
exports.login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    // Find user by studentId instead of email
    const user = await Student.findOne({ studentId });
    if (!user) return res.status(400).json({ message: "Invalid Student ID." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password." });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
// Fetch all students with search
exports.getStudentList = async (req, res) => {
  const { search } = req.query;
  try {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { studentId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const students = await Student.find(filter);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch a specific student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student by ID
exports.updateStudent = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If a new password is provided, hash it before updating
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedStudent) return res.status(404).json({ message: "Student not found" });

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Delete student by ID
// exports.deleteStudent = async (req, res) => {
//   try {
//     const deletedStudent = await Student.findByIdAndDelete(req.params.id);
//     if (!deletedStudent)
//       return res.status(404).json({ message: "Student not found" });
//     res.status(200).json({ message: "Student deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
