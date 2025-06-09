const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

async function buildDetailView(req, res, next) {
  const invId = parseInt(req.params.invId)
  try {
    const vehicle = await invModel.getVehicleById(invId)
    if (!vehicle) {
      throw new Error("Vehicle not found")
    }

    const nav = await utilities.getNav() // 🔸 Add this
    const vehicleHtml = utilities.buildVehicleHTML(vehicle)

    res.render("inventory/vehicle-detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav, // 🔸 Pass this into the view
      vehicleHtml,
      vehicle
    })
  } catch (error) {
    next(error)
  }
}