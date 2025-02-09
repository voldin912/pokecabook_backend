const express = require("express");
const { getCards, getCardCategories } = require("../controllers/cardsController");

const router = express.Router();

router.post("/cards", getCards);
router.get("/card-category", getCardCategories);

module.exports = router;
