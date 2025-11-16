const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 8,
  },
}, { timestamps: true });

const Semester = mongoose.model('Semester', semesterSchema);
module.exports = Semester;
