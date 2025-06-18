const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountModel = require("../models/account-model");

// Show login page
async function showLogin(req, res) {
  console.log("Rendering login page");
  res.render("account/login", {
    title: "Login",
    errorMessage: null,
    account_email: ""
  });
}

// Login function (POST)
async function loginAccount(req, res) {
  const { account_email, account_password } = req.body;
  console.log("Login attempt for email:", account_email);

  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("Account data found:", accountData);

  if (!accountData) {
    return res.status(400).render("account/login", {
      title: "Login",
      errorMessage: "Invalid email or password.",
      account_email
    });
  }

  const passwordMatch = await accountModel.comparePassword(account_password, accountData.account_password);
  if (!passwordMatch) {
    return res.status(400).render("account/login", {
      title: "Login",
      errorMessage: "Invalid email or password.",
      account_email
    });
  }

  // Generate JWT
  const token = jwt.sign(
    {
      account_id: accountData.account_id,
      account_type: accountData.account_type,
      account_firstname: accountData.account_firstname
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  // Store token in cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60,
  });

  // Redirect after successful login
  return res.redirect("/account/");
}

// Logout function
function logoutAccount(req, res) {
  console.log("Logging out user");
  res.clearCookie("jwt");
  res.redirect("/");
}

// Account dashboard (protected) - fetch fresh account data and render
async function buildAccountManagement(req, res) {
  try {
    const accountId = res.locals.account_id;
    const accountData = await accountModel.getAccountById(accountId);

    if (!accountData) {
      return res.redirect("/account/login");
    }

    res.render("account/account-management", {
      title: "Account Management",
      firstname: accountData.account_firstname,
      lastname: accountData.account_lastname,
      email: accountData.account_email,
      accountType: accountData.account_type,
      account_id: accountData.account_id,
      nav: await require("../utilities").getNav()
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    res.status(500).send("Server error. Please try again later.");
  }
}

// Show account update form (render update-account.ejs)
async function buildAccountUpdate(req, res) {
  try {
    const accountId = req.params.accountId;
    const accountData = await accountModel.getAccountById(accountId);

    if (!accountData) {
      return res.redirect("/account/");
    }

    res.render("account/update-account", {
      title: "Update Account",
      account: accountData, 
      nav: await require("../utilities").getNav(),
      errorMessage: null      
    });
  } catch (error) {
    console.error("Error loading account update form:", error);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "Sorry, unable to load the update form.",
      nav: await require("../utilities").getNav(),
    });
  }
}

// Process account info update
async function updateAccountInfo(req, res) {
  try {
    const { account_id, firstname, lastname, email } = req.body;

    // You can add validation here if needed

    await accountModel.updateAccountInfo(account_id, firstname, lastname, email);
    res.redirect("/account/");
  } catch (error) {
    console.error("Error updating account info:", error);

    // Reload update form with error message and previous data
    const accountData = {
      account_id: req.body.account_id,
      account_firstname: req.body.firstname,
      account_lastname: req.body.lastname,
      account_email: req.body.email,
    };

    res.status(500).render("account/update-account", {
      title: "Update Account",
      account: accountData,
      nav: await require("../utilities").getNav(),
      errorMessage: "Failed to update account information. Please try again.",
    });
  }
}

// Process password update
async function updatePassword(req, res) {
  try {
    const { account_id, new_password } = req.body;

    // Add password validation if needed

    await accountModel.updatePassword(account_id, new_password);
    res.redirect("/account/");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "Failed to update password.",
      nav: await require("../utilities").getNav(),
    });
  }
}

module.exports = {
  showLogin,
  loginAccount,
  logoutAccount,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccountInfo,
  updatePassword,
};