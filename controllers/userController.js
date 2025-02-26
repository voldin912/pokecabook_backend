const db = require("../config/db");
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    try {
      // Destructure data from request body
      const { name, email, password } = req.body;
  
      // Check if all necessary fields are present
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // SQL query to insert new user
      const query = `
        INSERT INTO users (name, email, password) 
        VALUES (?, ?, ?)
      `;
  
      // Execute the query to insert user into the database
      const result = await db.query(query, [name, email, hashedPassword]);
  
      // Send back the created user
      const newUser = { id: result.insertId, name, email };  // Adjust according to your DB schema
      res.status(201).json(newUser);
  
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllUsers = async (req, res) => {
    console.log("🔍 Fetching all users from the database");
    
    try {
      // SQL query to fetch all users' details from the database
      const query = 'SELECT * FROM users'; // Adjust columns if needed
      const [users] = await db.query(query);
  
      // Return the fetched users
      res.status(200).json(users);
      console.log("Fetched users:", users);
      
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateUsers = async (req, res) => {
  console.log(req.body,"body");
  
  try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!id || !name || !email) {
          return res.status(400).json({ message: "Missing required fields" });
      }

      const query = `UPDATE users SET name = ?, email = ? WHERE userID = ${id}`;
      const result = await db.query(query, [name, email]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ id, name, email });
  } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.deleteUsers = async (req, res) => {
  console.log("🗑️ Deleting user...");

  try {
      const { id } = req.params;
      console.log(id,'id');
      

      if (!id) {
          return res.status(400).json({ message: "Missing user ID" });
      }

      const query = `DELETE FROM users WHERE userID = ${id}`;
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
