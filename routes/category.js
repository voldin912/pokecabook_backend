const express = require("express");

const categoryController = require("../controllers/categoryController");

const router = express.Router();
router.post("/createCategory", categoryController.create);
router.get("/getCategory", categoryController.getAll);

router.post("/detailCategory", categoryController.detail);
// router.post("/detailCategory", (req, res) => {
//     console.log(req.body,"req.body");
    
// //    console.log(req,"=======//=========");
// //     try{
// //         res.send({code : 100, msg : "successfull"})
// //     }catch {
// //         res.send({code: 500, msg : "Error"})
// //     }

// })

// // Route to update an existing category
router.put("/updateCategory/:id", categoryController.update);

// // Route to delete a category
router.delete("/deleteCategory/:id", categoryController.delete);

module.exports = router;