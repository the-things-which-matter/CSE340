const bcrypt = require('bcryptjs');
const db = require('../database'); // Import the database module correctly

// Get account data by email
async function getAccountByEmail(email) {
  const sql = 'SELECT * FROM account WHERE account_email = $1';
  const result = await db.query(sql, [email]);
  return result.rows[0];
}

// Compare plain password to hashed password
async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Get account data by ID
async function getAccountById(accountId) {
  const sql = 'SELECT * FROM account WHERE account_id = $1';
  const result = await db.query(sql, [accountId]);
  return result.rows[0];
}

// Update account info (firstname, lastname, email)
async function updateAccountInfo(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
  `;
  const result = await db.query(sql, [firstname, lastname, email, account_id]);
  return result.rowCount > 0;
}

// Update password (hash password before saving)
async function updatePassword(account_id, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2
  `;
  const result = await db.query(sql, [hashedPassword, account_id]);
  return result.rowCount > 0;
}

module.exports = {
  getAccountByEmail,
  comparePassword,
  getAccountById,
  updateAccountInfo,
  updatePassword,
};
