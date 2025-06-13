const pool = require("../database/")

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  const sql = "SELECT * FROM classification ORDER BY classification_name";
  const result = await pool.query(sql);
  return result.rows;
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function insertClassification(classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
  return pool.query(sql, [classification_name]);
}

/* ***************************
 *  Get inventory items by classification ID
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
  }
}

/* ***************************
 *  Get vehicle by inventory ID (for detail view)
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

/* ***************************
 *  Insert new inventory item
 * ************************** */
async function insertInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("insertInventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Export all model functions
 * ************************** */
module.exports = {
  getClassifications,
  insertClassification,
  getInventoryByClassificationId,
  getVehicleById,
  insertInventory
}