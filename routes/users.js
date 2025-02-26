const express = require("express");
const { createUser, getAllUsers, updateUsers, deleteUsers } = require("../controllers/userController");

const router = express.Router();

// router.post("/create", createUser);
router.post("/create", createUser);
router.get("/read", getAllUsers);
router.put("/update/:id", updateUsers);
router.delete("/remove/:id", deleteUsers);


module.exports = router;