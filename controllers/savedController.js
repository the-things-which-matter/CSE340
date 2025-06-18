const savedModel = require("../models/savedModel");
const util = require("../utilities");

/** POST handler to save a vehicle */
async function saveVehicleHandler(req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const account_id = res.locals.account_id;

  if (!account_id) {
    req.flash("error", "You must be logged in to save a vehicle.");
    return res.redirect("/account/login");
  }

  try {
    await savedModel.saveVehicle(account_id, inv_id);
    req.flash("notice", "Vehicle saved to your account.");
  } catch (error) {
    req.flash("error", "Failed to save vehicle. Please try again.");
  }

  res.redirect("/saved/my-saved");
}

/** GET handler to view all saved vehicles */
async function buildSavedView(req, res) {
  const account_id = res.locals.account_id;
  if (!account_id) {
    req.flash("error", "You must be logged in to view saved vehicles.");
    return res.redirect("/account/login");
  }

  try {
    const vehicles = await savedModel.getSavedVehiclesByAccount(account_id);
    const nav = await util.getNav();

    // Use the utility function to build saved vehicles HTML grid
    const savedGrid = util.buildSavedVehiclesGrid(vehicles);

    res.render("saved/my-saved", {
      title: "My Saved Vehicles",
      nav,
      savedGrid, 
      errors: null,
    });
  } catch (error) {
    req.flash("error", "Could not load saved vehicles.");
    res.redirect("/account");
  }
}

module.exports = {
  saveVehicleHandler,
  buildSavedView,
};