const Session = require("../../models/admin/Session");

// Create Session
exports.createSession = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if session already exists
    const existingSession = await Session.findOne({ name });
    if (existingSession) {
      return res.status(400).json({ message: "Session already exists" });
    }

    // Create new session if no duplicate is found
    const session = new Session({ name });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Session by ID
exports.getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Sessions
exports.getAllSessions = async (req, res) => {
  try {
    const { search = "" } = req.query;

    // Search sessions by name using regex
    const sessions = await Session.find({
      name: { $regex: search, $options: "i" },
    });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Edit Session
// Edit Session

exports.editSession = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Check if session with the new name already exists
    const existingSession = await Session.findOne({ name });
    if (existingSession && existingSession._id.toString() !== id) {
      return res.status(400).json({ message: "Session name already in use" });
    }

    const session = await Session.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Session
exports.deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findByIdAndDelete(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
