const express = require("express");
const { getCards, getCardCategories, getAll } = require("../controllers/cardsController");

const router = express.Router();

router.post("/cards", getCards);
router.get("/card-category", getCardCategories);
router.get("/cards", getAll);

module.exports = router;
