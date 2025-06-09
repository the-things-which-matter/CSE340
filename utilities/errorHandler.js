




function handleErrors(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Oops! Something went wrong.",
    error: err  // <-- this must be here
  });
}
module.exports = handleErrors;