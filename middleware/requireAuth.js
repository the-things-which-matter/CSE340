// middleware/requireAuth.js

function requireAuth(req, res, next) {
  if (res.locals.loggedin) {
    return next();
  } else {
    return res.redirect('/account/login');
  }
}

module.exports = requireAuth;