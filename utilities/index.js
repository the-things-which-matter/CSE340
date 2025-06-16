const invModel = require("../models/inventory-model");
const Util = {};

// Middleware to check account type (Admin or Employee only)
Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountType;

  if (accountType === "Admin" || accountType === "Employee") {
    next();
  } else {
    req.flash("notice", "You must be an employee or admin to access that page.");
    return res.redirect("/account/login");
  }
};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();  // data is an array
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.forEach((row) => {  // Use data directly as an array
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      let imageFilename = vehicle.inv_thumbnail || '';

      // Clean any leading /images/ if exists (just in case)
      if (imageFilename.startsWith('/images/')) {
        imageFilename = imageFilename.substring('/images/'.length);
      }
      if (!imageFilename.startsWith('vehicles/')) {
        imageFilename = `vehicles/${imageFilename}`;
      }

      const fullImageUrl = `/images/${imageFilename}`;

      grid += '<li>';
      grid += '<a href="/inv/detail/' + vehicle.inv_id 
           + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid += '<img src="' + fullImageUrl 
           + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
      grid += '</a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetail = function(vehicle) {
  let imageFilename = vehicle.inv_image || '';

  // Debug: log original image path
  console.log("Original inv_image value:", imageFilename);

  if (imageFilename.startsWith('/images/')) {
    imageFilename = imageFilename.substring('/images/'.length);
  }
  if (!imageFilename.startsWith('vehicles/')) {
    imageFilename = `vehicles/${imageFilename}`;
  }

  const fullImageUrl = `/images/${imageFilename}`;

  // Debug: log final image URL being used
  console.log("Final image URL:", fullImageUrl);

  let html = '<div class="vehicle-detail">';
  html += `<h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
  html += `<img src="${fullImageUrl}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />`;
  html += `<p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
  html += `<p><strong>Year:</strong> ${vehicle.inv_year}</p>`;
  html += `<p><strong>Mileage:</strong> ${vehicle.inv_miles} miles</p>`;
  html += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;
  html += `<p><strong>Description:</strong> ${vehicle.inv_description}</p>`;
  html += '</div>';

  return html;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util;