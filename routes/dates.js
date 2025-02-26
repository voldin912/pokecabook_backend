const express = require("express");
const { getEventByDay, getDatesDetails } = require("../controllers/datesController");
const router = express.Router();

router.get("/day-card", getEventByDay);
router.get("/date-card/:id", getDatesDetails);

module.exports = router;
