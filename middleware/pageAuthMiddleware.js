const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Check user login
const pageAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login");
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check user in database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    // Store user information
    req.user = user;
    res.locals.currentUser = user;
    next();

  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

// Admin authorization
const pageAdminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).render("pages/403");
  }
  next();
};

// User authorization
const pageUserMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).render("pages/403");
  }
  next();
};

module.exports = {
  pageAuthMiddleware,
  pageAdminMiddleware,
  pageUserMiddleware
};
