const bcrypt = require('bcryptjs');
const db = require('./config/db');

(async () => {
  try {
    const pool = await db.getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        userID INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        userType ENUM('patient','doctor','receptionist','accountant','admin') NOT NULL,
        isActive TINYINT(1) DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        adminID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL UNIQUE,
        permissions JSON DEFAULT NULL,
        accessLevel ENUM('super','standard','limited') DEFAULT 'standard',
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const passwordHash = await bcrypt.hash('admin123', 10);
    const [rows] = await pool.query('SELECT userID FROM users WHERE email = ?', ['admin@primeheal.com']);

    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, userType, isActive) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@primeheal.com', passwordHash, 'admin', 1]
      );

      await pool.query(
        'INSERT INTO admin (userID, permissions, accessLevel) VALUES (?, ?, ?)',
        [result.insertId, '{"manage_users": true, "view_reports": true, "manage_settings": true, "handle_complaints": true}', 'super']
      );
    } else {
      await pool.query(
        'UPDATE users SET password = ?, userType = ?, isActive = 1 WHERE email = ?',
        [passwordHash, 'admin', 'admin@primeheal.com']
      );

      await pool.query(
        'INSERT INTO admin (userID, permissions, accessLevel) SELECT userID, ?, ? FROM users WHERE email = ? AND NOT EXISTS (SELECT 1 FROM admin WHERE admin.userID = users.userID)',
        ['{"manage_users": true, "view_reports": true, "manage_settings": true, "handle_complaints": true}', 'super', 'admin@primeheal.com']
      );
    }

    console.log('Admin account ready: admin@primeheal.com / admin123');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
