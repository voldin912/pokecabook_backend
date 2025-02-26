const db = require('../db');

const findUser = async (email) => {
    const query = `SELECT * FROM users WHERE email = ?`
  try {
    const [rows] = await db.query(query, [email]);
    return rows[0]; // Return the first row if found
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
};

module.exports = {
  findUser,
};
