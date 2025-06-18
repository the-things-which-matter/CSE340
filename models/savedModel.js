const pool = require("../database/"); 

/** Save a vehicle for a user */
async function saveVehicle(account_id, inv_id) {
  try {
    console.log("saveVehicle called with:", { account_id, inv_id });

    const sql = `
      INSERT INTO saved_vehicles (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
      RETURNING *;
    `;

    console.log("Running query:", sql.trim());
    const result = await pool.query(sql, [account_id, inv_id]);

    console.log("Query result:", result.rows);
    return result.rows[0];
  } catch (error) {
    console.error("Error saving vehicle:", error);
    throw new Error("Database error when saving vehicle.");
  }
}

/** Get all saved vehicles for a user */
async function getSavedVehiclesByAccount(account_id) {
  try {
    console.log("getSavedVehiclesByAccount called with account_id:", account_id);

    const sql = `
      SELECT i.*
      FROM saved_vehicles s
      JOIN inventory i ON s.inv_id = i.inv_id
      WHERE s.account_id = $1
      ORDER BY i.inv_make, i.inv_model;
    `;

    console.log("Running query:", sql.trim());
    const result = await pool.query(sql, [account_id]);

    console.log("Query result rows:", result.rows.length);
    return result.rows;
  } catch (error) {
    console.error("Error fetching saved vehicles:", error);
    throw new Error("Database error when fetching saved vehicles.");
  }
}

module.exports = {
  saveVehicle,
  getSavedVehiclesByAccount,
};