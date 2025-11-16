const express = require("express");
const {
  getStatistics,
} = require("../../controllers/admin/statisticsController");

const router = express.Router();

router.get("/", getStatistics); // Define the route

module.exports = router;
