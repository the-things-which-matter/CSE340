// routes/savedRoute.js

const express = require("express");
const router = express.Router();
const savedController = require("../controllers/savedController");

// Import middleware
const checkLogin = require("../middleware/checkLogin");
const requireAuth = require("../middleware/requireAuth");

// 🔐 Apply auth middleware to all routes in this router
router.use(checkLogin, requireAuth);

/**
 * @route   POST /save/:inv_id
 * @desc    Save a vehicle to user's saved list
 * @access  Protected
 */
router.post("/save/:inv_id", savedController.saveVehicleHandler);

/**
 * @route   GET /my-saved
 * @desc    Display user's saved vehicles
 * @access  Protected
 */
router.get("/my-saved", savedController.buildSavedView);

module.exports = router;