const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accountsController");

// Import middleware functions
const checkLogin = require("../middleware/checkLogin");
const requireAuth = require("../middleware/requireAuth");

// Public routes
router.get("/login", accountsController.showLogin);
router.post("/login", accountsController.loginAccount);
router.get("/logout", accountsController.logoutAccount);

// Protected routes
router.get("/", checkLogin, requireAuth, accountsController.buildAccountManagement);
router.get("/my-account", checkLogin, requireAuth, accountsController.buildAccountManagement);

router.get("/update/:accountId", checkLogin, requireAuth, accountsController.buildAccountUpdate);
router.post("/update", checkLogin, requireAuth, accountsController.updateAccountInfo);

router.post("/update-password", checkLogin, requireAuth, accountsController.updatePassword);

module.exports = router;