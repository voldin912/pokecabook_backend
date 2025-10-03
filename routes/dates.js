const express = require("express");
const { getEventByDay, getDatesDetails, getDatesDetailsEnhanced } = require("../controllers/datesController");
const router = express.Router();

router.get("/day-card", getEventByDay);
router.get("/date-card/:id", getDatesDetails);
router.get("/date-card-enhanced/:id", getDatesDetailsEnhanced);

module.exports = router;
