const jwt = require("jsonwebtoken");
require("dotenv").config();

function checkLogin(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    res.locals.loggedin = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Use exact keys from your JWT payload
    res.locals.loggedin = true;
    res.locals.accountId = decoded.account_id;
    res.locals.accountType = decoded.account_type;
    res.locals.firstname = decoded.account_firstname;

    next();
  } catch (error) {
    // Token invalid or expired
    res.locals.loggedin = false;
    // Optional: clear invalid token cookie
    // res.clearCookie("jwt");
    next();
  }
}

module.exports = checkLogin;