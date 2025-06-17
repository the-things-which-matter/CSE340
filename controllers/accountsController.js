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

// Login function
async function loginAccount(req, res) {
  const { account_email, account_password } = req.body;
  console.log("Login attempt for email:", account_email);

  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("Account data found:", accountData);

  if (!accountData) {
    console.log("No account found with that email");
    return res.status(400).render("account/login", {
      title: "Login",
      errorMessage: "Invalid email or password.",
      account_email
    });
  }

  // Add debugging for exact input and hash
  console.log(`Password entered (raw): "${account_password}"`);
  console.log(`Stored password hash: "${accountData.account_password}"`);

  const passwordMatch = await accountModel.comparePassword(account_password, accountData.account_password);
  console.log("Password match result:", passwordMatch);

  if (!passwordMatch) {
    console.log("Password did not match");
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
  console.log("JWT token generated");

  // Store token in cookie with secure options
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 
  });
  console.log("JWT token stored in cookie");

  // Redirect to account dashboard
  res.redirect("/account/");
}

// Logout function
function logoutAccount(req, res) {
  console.log("Logging out user");
  res.clearCookie("jwt");
  res.redirect("/");
}

// Account dashboard page
async function buildAccountManagement(req, res) {
  try {
    const token = req.cookies.jwt;
    console.log("JWT token from cookie:", token);

    if (!token) {
      console.log("No token found, redirecting to login");
      return res.redirect("/account/login");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded JWT token:", decoded);

    const accountData = await accountModel.getAccountById(decoded.account_id);
    console.log("Account data fetched:", accountData);

    if (!accountData) {
      console.log("No account data found, redirecting to login");
      return res.redirect("/account/login");
    }

    res.render("account/account-management", {
      title: "Account Management",
      firstname: accountData.account_firstname,
      lastname: accountData.account_lastname,
      email: accountData.account_email,
      accountType: accountData.account_type,
      account_id: accountData.account_id
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    res.redirect("/account/login");
  }
}

// Show account update form
async function buildAccountUpdate(req, res) {
  try {
    const accountId = req.params.accountId;
    console.log("Account ID param received for update:", accountId);

    const accountData = await accountModel.getAccountById(accountId);
    console.log("Account data fetched for update:", accountData);

    res.render("account/update-account", {
      title: "Update Account",
      account: accountData,
      errorMessage: null
    });
  } catch (error) {
    console.error("Error in buildAccountUpdate:", error);
    res.redirect("/account/");
  }
}

// Handle account info update POST
async function updateAccountInfo(req, res) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    console.log("Update account info for ID:", account_id);

    const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
    console.log("Update result:", updateResult);

    if (updateResult) {
      res.redirect("/account/");
    } else {
      res.status(400).render("account/update-account", {
        title: "Update Account",
        account: req.body,
        errorMessage: "Failed to update account information."
      });
    }
  } catch (error) {
    console.error("Error in updateAccountInfo:", error);
    res.status(500).render("account/update-account", {
      title: "Update Account",
      account: req.body,
      errorMessage: "An error occurred while updating account information."
    });
  }
}

// Handle password update POST
async function updatePassword(req, res) {
  try {
    const { account_id, new_password } = req.body;
    console.log("Update password for account ID:", account_id);

    const updateResult = await accountModel.updatePassword(account_id, new_password);
    console.log("Password update result:", updateResult);

    if (updateResult) {
      res.redirect("/account/");
    } else {
      res.status(400).render("account/update-password", {
        title: "Update Password",
        errorMessage: "Failed to update password."
      });
    }
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(500).render("account/update-password", {
      title: "Update Password",
      errorMessage: "An error occurred while updating password."
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
  updatePassword
};