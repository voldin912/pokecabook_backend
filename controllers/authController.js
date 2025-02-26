const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  console.log(req.body, "req")
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  try {
    // Find the user from the database
    const user = await userModel.findUser(email, password);
    
    if (!user) {
        return res.status(401).json({ message: 'ユーザーデータが存在しません' });
    }
    
    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log(user, "user");
    if (!isMatch) {
      return res.status(401).json({ message: 'パスワードが正確ではありません' });
    }

    // Generate JWT token
    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Respond with token
    return res.status(200).json({ 'token' : token, "msg" : "購読成功!" });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'サービングエラー' });
  }
}