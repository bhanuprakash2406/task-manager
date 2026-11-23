const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER PAGE
const registerPage = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validate fields
        if (!name || !email || !password || !confirmPassword) {
            return res.render("pages/register", {
                error: "Please fill in all fields"
            });
        }

        if (password.length < 6) {
            return res.render("pages/register", {
                error: "Password must contain at least 6 characters"
            });
        }

        if (password !== confirmPassword) {
            return res.render("pages/register", {
                error: "Passwords do not match"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.render("pages/register", {
                error: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (public registration is always user role)
        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user"
        });

        return res.render("pages/login", {
            success: "Account created successfully. Please login."
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).render("pages/register", {
            error: "Something went wrong. Please try again."
        });
    }
};


// LOGIN PAGE
const loginPage = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("pages/login", {
                error: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.render("pages/login", {
                error: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.render("pages/login", {
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        // Redirect based on role
        if (user.role === "admin") {
            return res.redirect("/admin/dashboard");
        }

        return res.redirect("/user/dashboard");

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).render("pages/login", {
            error: "Something went wrong. Please try again."
        });
    }
};


// LOGOUT
const logoutPage = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return res.redirect("/login");
};


module.exports = {
    registerPage,
    loginPage,
    logoutPage
};
