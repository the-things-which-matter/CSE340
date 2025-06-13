const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    console.log("buildByClassificationId called with classificationId:", req.params.classificationId);
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    console.log("Data received from model:", data.length, "items");

    if (data.length === 0) {
      throw new Error("No inventory found for this classification");
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
    console.log("Rendered classification view");
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    console.log("buildDetailView called with inv_id:", req.params.inv_id);
    const inv_id = parseInt(req.params.inv_id);
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      console.log("Vehicle not found for id:", inv_id);
      return next(new Error("Vehicle not found"));
    }

    const vehicleHtml = utilities.buildVehicleDetail(vehicleData);
    const nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleData,
      vehicleHtml,
    });
    console.log("Rendered detail view for vehicle:", vehicleData.inv_make, vehicleData.inv_model);
  } catch (error) {
    console.error("Error in buildDetailView:", error);
    next(error);
  }
};

/* ***************************
 *  Deliver the Inventory Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    console.log("buildManagement called");
    const nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      message: req.flash("message"),
    });
    console.log("Rendered management view");
  } catch (error) {
    console.error("Error in buildManagement:", error);
    next(error);
  }
};

// Show Add Classification Form
invCont.showAddClassificationForm = async (req, res, next) => {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    classification_name: "",
  });
};

// Show Add Inventory Form
invCont.showAddInventoryForm = async (req, res, next) => {
  const nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classifications,
    errors: null,
    formData: {},
  });
};

// Handle Add Classification POST request
invCont.addClassification = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = [];

  if (!classification_name || classification_name.trim().length < 3) {
    errors.push("Classification name is required and must be at least 3 characters.");
  }

  if (errors.length > 0) {
    const nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name: classification_name || "",
    });
  }

  try {
    console.log("Inserting classification:", classification_name);
    const result = await invModel.insertClassification(classification_name.trim());
    console.log("Insert result:", result);
    req.flash("message", "New classification added successfully!");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error inserting classification:", error);
    next(error);
  }
};

// Handle Add Inventory POST request
invCont.addInventory = async (req, res, next) => {
  console.log("addInventory controller called");
  console.log("Request body received:", req.body);

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  // ✅ Set default images if not provided
  const inv_image = req.body.inv_image || '/images/vehicles/no-image.png';
  const inv_thumbnail = req.body.inv_thumbnail || '/images/vehicles/no-image.png';

  const errors = [];
  if (!classification_id) errors.push("Classification is required.");
  if (!inv_make) errors.push("Make is required.");
  if (!inv_model) errors.push("Model is required.");
  if (!inv_year) errors.push("Year is required.");
  if (!inv_price) errors.push("Price is required.");

  if (errors.length > 0) {
    console.log("Validation errors found:", errors);
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classifications,
      errors,
      formData: req.body,
    });
  }

  try {
    console.log("Inserting inventory with data:", {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });

    const result = await invModel.insertInventory(
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
    );

    console.log("Inventory insert result:", result);
    req.flash("message", "Inventory item successfully added!");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error inserting inventory:", error);
    next(error);
  }
};

module.exports = invCont;