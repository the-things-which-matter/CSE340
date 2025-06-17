/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const baseController = require("./controllers/baseController");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const static = require("./routes/static");
const utilities = require("./utilities");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require('./routes/accountRoute');

const session = require("express-session");
const flash = require("express-flash");
const checkLogin = require('./middleware/checkLogin');

/* ***********************
 * View engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware to serve static files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Middleware to parse cookies
 *************************/
app.use(cookieParser());  

/* ***********************
 * Middleware to check login (set locals)
 *************************/
app.use(checkLogin);

/* ***********************
 * Session and Flash Middleware
 *************************/
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

app.use(flash());

/* ***********************
 * Middleware for form data parsing
 *************************/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ***********************
 * Middleware to set login info from JWT cookie
 *************************/
app.use((req, res, next) => {
  const token = req.cookies?.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.loggedin = true;
      res.locals.firstname = decoded.account_firstname;
      res.locals.accountType = decoded.account_type;
      res.locals.accountId = decoded.account_id; 
    } catch (err) {
      // token invalid or expired
      res.locals.loggedin = false;
     
    }
  } else {
    res.locals.loggedin = false;
  }
  next();
});

/* ***********************
 * Middleware to add nav to res.locals for all views
 *************************/
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (error) {
    next(error);
  }
});

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/account", accountRoute); 
app.use("/inv", inventoryRoute);

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Force error route (for testing error handling)
app.get("/force-error", (req, res, next) => {
  next(new Error("Forced error test"));
});

/* ***********************
 * File Not Found Route (404)
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Error Handler Middleware (500)
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});