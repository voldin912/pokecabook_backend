const express = require("express");
const { getPlaces, getTotalPlaces, getPlacesDetails } = require("../controllers/placesController");

const router = express.Router();

router.post("/place-card", getPlaces);
router.get("/place-card/total", getTotalPlaces);
router.get("/place-card/:id", getPlacesDetails);


module.exports = router;
