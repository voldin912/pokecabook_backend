const express = require("express");
const { getPlaces, getTotalPlaces } = require("../controllers/placesController");

const router = express.Router();

router.post("/place-card", getPlaces);
router.get("/place-card/total", getTotalPlaces);

module.exports = router;
