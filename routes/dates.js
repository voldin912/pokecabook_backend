const express = require("express");
const { getEventByDay } = require("../controllers/datesController");

const router = express.Router();

router.get("/day-card", getEventByDay);

module.exports = router;
