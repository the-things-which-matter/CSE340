function requireAuth(req, res, next) {
    if (!res.locals.loggedin) {
      return res.redirect("/account/login");
    }
    next();
}
  

  
  module.exports = requireAuth;