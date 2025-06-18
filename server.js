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
const session = require("express-session");
const flash = require("express-flash");

const app = express();

const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const savedRoutes = require("./routes/savedRoute");

const utilities = require("./utilities");
const checkLogin = require("./middleware/checkLogin");

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
 * Middleware to check login and set res.locals
 * ONLY this middleware decodes JWT and sets loggedin/account_id
 *************************/
app.use(checkLogin);

/* ***********************
 * Session and Flash Middleware
 *************************/
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutes
  })
);
app.use(flash());

/* ***********************
 * Middleware to parse incoming request data
 *************************/
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ***********************
 * Add nav to res.locals for all views
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
app.use("/saved", savedRoutes); // handles /saved/save/:inv_id and /saved/my-saved

/* Home Route */
app.get("/", utilities.handleErrors(baseController.buildHome));

/* Force Error Route (for testing) */
app.get("/force-error", (req, res, next) => {
  next(new Error("Forced error test"));
});

/* ***********************
 * 404 Error Handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});