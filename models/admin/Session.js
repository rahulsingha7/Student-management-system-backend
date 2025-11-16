// models/admin/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /Fall|Spring/i.test(value); // Check if the name contains 'Fall' or 'Spring'
      },
      message: (props) =>
        `${props.value} must contain either "Fall" or "Spring"!`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
