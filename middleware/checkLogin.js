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

    res.locals.loggedin = true;
    res.locals.accountId = decoded.account_id;
    res.locals.accountType = decoded.account_type;
    res.locals.firstname = decoded.account_firstname;

    next();
  } catch (error) {
    res.locals.loggedin = false;
    next();
  }
}

module.exports = checkLogin;