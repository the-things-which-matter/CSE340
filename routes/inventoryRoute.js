const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");  // import utilities to get access to middleware

// Route to build inventory by classification view (public)
router.get("/type/:classificationId", invController.buildByClassificationId);

// Detail view route (public)
router.get("/detail/:inv_id", invController.buildDetailView);

// Inventory Management Route 
router.get("/", utilities.checkAccountType, invController.buildManagement);

// Show form to add classification 
router.get('/add-classification', utilities.checkAccountType, invController.showAddClassificationForm);

// Show form to add inventory 
router.get('/add-inventory', utilities.checkAccountType, invController.showAddInventoryForm);

// Handle form submission for adding classification
router.post('/add-classification', utilities.checkAccountType, invController.addClassification);

// Handle form submission for adding inventory 
router.post('/add-inventory', utilities.checkAccountType, invController.addInventory);

module.exports = router;