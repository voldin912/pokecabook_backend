const express = require("express");
const { createCardDetail, getAllCardDetail, updateCardDetail, deleteCardDetail } = require("../controllers/cardDetailController");

const router = express.Router();

router.post("/card_detail/create", createCardDetail);
router.get("/card_detail/read", getAllCardDetail);
router.put("/card_detail/update/:id", updateCardDetail);
router.delete("/card_detail/remove/:id", deleteCardDetail);


module.exports = router;