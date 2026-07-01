const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// @route   POST /api/auth/register
// @desc    Register a new patient
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if user exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into users table
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'patient']
    );
    
    const userId = userResult.insertId;

    // Generate a unique patient code (e.g., PT-0000X)
    const patientCode = `PT-${String(userId).padStart(5, '0')}`;

    // Insert into patient table
    await connection.query(
      'INSERT INTO patient (userID, patientCode) VALUES (?, ?)',
      [userId, patientCode]
    );

    await connection.commit();

    // Create token
    const token = jwt.sign(
      { userID: userId, userType: 'patient', name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: userId,
        name,
        email,
        userType: 'patient'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    connection.release();
  }
};

// @route   POST /api/auth/login
// @desc    Login user (any type)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Let's get the specific role ID to include in the payload if needed
    let roleId = null;
    if (user.userType === 'patient') {
      const [rows] = await pool.query('SELECT patientID FROM patient WHERE userID = ?', [user.userID]);
      if (rows.length > 0) roleId = rows[0].patientID;
    } else if (user.userType === 'doctor') {
      const [rows] = await pool.query('SELECT doctorID FROM doctor WHERE userID = ?', [user.userID]);
      if (rows.length > 0) roleId = rows[0].doctorID;
    } else if (user.userType === 'receptionist') {
      const [rows] = await pool.query('SELECT receptionistID FROM receptionist WHERE userID = ?', [user.userID]);
      if (rows.length > 0) roleId = rows[0].receptionistID;
    } else if (user.userType === 'accountant') {
      const [rows] = await pool.query('SELECT accountantID FROM accountant WHERE userID = ?', [user.userID]);
      if (rows.length > 0) roleId = rows[0].accountantID;
    } else if (user.userType === 'admin') {
      const [rows] = await pool.query('SELECT adminID FROM admin WHERE userID = ?', [user.userID]);
      if (rows.length > 0) roleId = rows[0].adminID;
    }

    // Create token
    const token = jwt.sign(
      { 
        userID: user.userID, 
        userType: user.userType, 
        name: user.name,
        roleID: roleId
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user.userID,
        name: user.name,
        email: user.email,
        userType: user.userType,
        roleID: roleId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login
};
