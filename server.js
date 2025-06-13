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

const session = require("express-session");
const flash = require("express-flash");

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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



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

app.use(flash());


// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

// Index route
//app.get("/", function (req, res) {
//  res.render("index", { title: "Home" })
//})

//app.get("/", baseController.buildHome)
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute)

app.get("/force-error", (req, res, next) => {
  next(new Error("Forced error test"));
});

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

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})




// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})


/* ***********************
 * Log statement to confirm server operation
 *************************/
//app.use(function (req, res) {
//  res.status(404).render("error/error", {
 //   title: "404 Not Found",
//    message: "The page you requested does not exist.",
//    nav: res.locals.nav
//  });
//});

// 404 middleware
//app.use(function (req, res) {
//  res.status(404).render("error", { title: "404 Not Found", message: "The page you requested does not exist." });
//});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Server Error");
});




const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})



