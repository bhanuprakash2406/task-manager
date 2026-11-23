const express = require("express");
const router = express.Router();

const {
    registerPage,
    loginPage,
    logoutPage
} = require("../controllers/pageController");

// Home page
router.get("/", (req, res) => {
    res.render("pages/home");
});

// Register
router.get("/register", (req, res) => {
    res.render("pages/register", { error: null });
});
router.post("/register", registerPage);

// Login
router.get("/login", (req, res) => {
    res.render("pages/login", {
        error: null,
        success: null
    });
});
router.post("/login", loginPage);

// Logout
router.post("/logout", logoutPage);

//

module.exports = router;
