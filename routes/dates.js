const express = require("express");
const { getEventByDay, getPlacesDetails } = require("../controllers/datesController");
const router = express.Router();

router.get("/day-card", getEventByDay);
router.get("/place-card/:id", getPlacesDetails);

module.exports = router;
