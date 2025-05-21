const express = require("express");
const { getDecks, getTotalDecks, getDecksDetails } = require("../controllers/deckController");

const router = express.Router();

router.post("/decks", getDecks);
router.get("/decks/total", getTotalDecks);
router.get("/decks/:id", getDecksDetails);


module.exports = router;
