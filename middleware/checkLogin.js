

const jwt = require("jsonwebtoken");
require("dotenv").config();
function checkLogin(req, res, next) {
  const token = req.cookies?.jwt;
  console.log("checkLogin - token:", token);
  if (!token) {
    console.log("No JWT token found in cookies");
    res.locals.loggedin = false;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("JWT verified:", decoded);
    res.locals.loggedin = true;
    res.locals.account_id = decoded.account_id;
    res.locals.account_type = decoded.account_type;
    res.locals.firstname = decoded.account_firstname;
    next();
  } catch (error) {
    console.log("JWT verify error:", error.message);
    res.locals.loggedin = false;
    next();
  }
}

module.exports = checkLogin;