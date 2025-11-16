const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    uppercase: true, // Ensures 'A' and 'a' are treated the same
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  }
}, { timestamps: true });

// Ensure unique section per session-semester combination
sectionSchema.index({ section: 1, semester: 1, session: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;
