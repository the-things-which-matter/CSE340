const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController")

// const invController = require("../controllers/invController");

// router.get("/", invController.buildInventoryList);
// router.get("/detail/:invId", invController.buildDetailView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Detail view route
//router.get("/detail/:inv_id", invController.buildDetailView);        changed inv_id to invId / i change it back to inv_id
router.get("/detail/:inv_id", invController.buildDetailView);

module.exports = router;

