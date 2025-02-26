const db = require("../config/db");

exports.create = async (req, res) => {
  const con = ''
  try {
    const { categoryName, inputs } = req.body;
    
    // Validate category name and inputs
    if (!categoryName || !inputs || !Array.isArray(inputs)) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const cond = JSON.stringify(inputs);
    
    console.log(typeof(cond),cond,  "body");
    
    
    // Insert category into the deck_categories1 table
    // const query = `INSERT INTO deck_categories1 (category1_var, condition) VALUES (?, ?)`;
    // const result = await db.query(query, [categoryName, condition]);
    const query = `INSERT INTO deck_categories1 (category1_var, conds) VALUES (?, ?)`;
    const result = await db.query(query, [categoryName, cond]);

    const newCategory = { id : result.insertId, categoryName, inputs}; // Get the inserted category's ID
    res.status(201).json(newCategory);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Fetch all categories
exports.getAll = async (req, res) => {
  try {
    const query = "SELECT * FROM deck_categories1"; // Get all categories
    const [rows] = await db.query(query);
    
    // const reDefine = [];
    // for(let i = 0; i <= rows.length; i ++){
    //   reDefine[i] = "カード名" + rows[i].conds.cardName + '|' + 'カードカウント' + rows[i].conds.cardNumber + '|' + "条件" + rows[i].conds.cardCondition;
    // }
    // console.log(reDefine, "redefine");
    
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch category by ID
exports.detail = async (req, res) => {
  const { name } = req.body; // Get category ID from URL parameter
  console.log("****kohei",req.body)
  try {
    const query = "SELECT * FROM deck_categories1 WHERE category1_var = ?";
    const [rows] = await db.query(query, [name]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(rows[0]); // Return the first (and only) result
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params; // Get category ID from URL parameter
  const { categoryName, inputs } = req.body; // Get new values from the body

  if (!categoryName || !inputs || !Array.isArray(inputs)) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const conds = JSON.stringify(inputs);

  try {
    // Update the category in the deck_categories1 table
    const query = "UPDATE deck_categories1 SET category1_var = ?, conds = ? WHERE id = ?";
    const [result] = await db.query(query, [categoryName, conds, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Return the updated category
    const updatedCategory = { id, categoryName, inputs };
    res.status(200).json(updatedCategory);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.delete= async (req, res) => {
  const { id } = req.params; // Get category ID from URL parameter

  try {
    const query = "DELETE FROM deck_categories1 WHERE id = ?";
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

