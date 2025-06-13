const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Detail view route
router.get("/detail/:inv_id", invController.buildDetailView);

// Inventory Management Route
router.get("/", invController.buildManagement)




// Show form to add classification
router.get('/add-classification', invController.showAddClassificationForm);

// Show form to add inventory
router.get('/add-inventory', invController.showAddInventoryForm);

// Handle form submission for adding classification
router.post('/add-classification', invController.addClassification);

// Handle form submission for adding inventory
router.post('/add-inventory', invController.addInventory);






module.exports = router;