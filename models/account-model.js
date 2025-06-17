const bcrypt = require('bcryptjs');
const db = require('../database'); // Import the database module correctly

// Get account data by email
async function getAccountByEmail(email) {
  try {
    const sql = 'SELECT * FROM account WHERE account_email = $1';
    const result = await db.query(sql, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in getAccountByEmail:', error);
    throw error;
  }
}

// Compare plain password to hashed password
async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error in comparePassword:', error);
    throw error;
  }
}

// Get account data by ID
async function getAccountById(accountId) {
  try {
    const sql = 'SELECT * FROM account WHERE account_id = $1';
    const result = await db.query(sql, [accountId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in getAccountById:', error);
    throw error;
  }
}

// Update account info (firstname, lastname, email) and return updated row
async function updateAccountInfo(accountId, firstname, lastname, email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `;
    const result = await db.query(sql, [firstname, lastname, email, accountId]);
    return result.rows[0]; 
  } catch (error) {
    console.error('Error in updateAccountInfo:', error);
    throw error;
  }
}

// Update password (hash password before saving) and return updated row
async function updatePassword(accountId, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *;
    `;
    const result = await db.query(sql, [hashedPassword, accountId]);
    return result.rows[0]; 
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw error;
  }
}

module.exports = {
  getAccountByEmail,
  comparePassword,
  getAccountById,
  updateAccountInfo,
  updatePassword,
};