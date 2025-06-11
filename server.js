/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const baseController = require("./controllers/baseController")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const utilities = require("./utilities")  // <-- added here

const inventoryRoute = require("./routes/inventoryRoute")

console.log("DEBUG: utilities object:", utilities)

/* ***********************
 * View engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root




/* ***********************
 * Middleware to serve static files
 *************************/
app.use(express.static("public"))

/* ***********************
 * Middleware to add nav to res.locals for all views
 *************************/
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (error) {
    next(error)
  }
})

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
//app.get("/", function (req, res) {
//  res.render("index", { title: "Home" })
//})

app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
//const port = process.env.PORT
//const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/

/*removed this , deploying issue*/
/*app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})*/

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})