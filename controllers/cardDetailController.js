const db = require("../config/db");
const bcrypt = require('bcrypt');

exports.createCardDetail = async (req, res) => {
    try {
      // Destructure data from request body
      const {name} = req.body;
  
      // Check if all necessary fields are present
      if (!name) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // SQL query to insert new user
      const query = `
        INSERT INTO cards_detail (name) 
        VALUES (?)
      `;
  
      // Execute the query to insert user into the database
      const result = await db.query(query, [name]);
  
      // Send back the created user
      const newUser = { id: result.insertId, name};  // Adjust according to your DB schema
      res.status(201).json(newUser);
  
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllCardDetail = async (req, res) => {
    console.log("🔍 Fetching all users from the database");
    
    try {
      // SQL query to fetch all users' details from the database
      const query = 'SELECT * FROM cards_detail'; // Adjust columns if needed
      const [cards] = await db.query(query);
  
      // Return the fetched users
      res.status(200).json(cards);
      console.log("Fetched cards:", cards);
      
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateCardDetail = async (req, res) => {
  console.log(req.body,"body");
  try {
      const { id } = req.params;
      const { name} = req.body;

      if (!id || !name) {
          return res.status(400).json({ message: "Missing required fields" });
      }

      const query = `UPDATE cards_detail SET name = ? WHERE id = ${id}`;
      const result = await db.query(query, [name]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ id, name});
  } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.deleteCardDetail = async (req, res) => {

  try {
      const { id } = req.params;
      console.log(id,'id');
      

      if (!id) {
          return res.status(400).json({ message: "Missing user ID" });
      }

      const query = `DELETE FROM cards_detail WHERE id = ${id}`;
      const result = await db.query(query, [id]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Internal Server Error" });
  }
};
