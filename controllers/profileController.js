const User = require("../models/User");
const bcrypt = require("bcrypt");

// =================================
// GET USER PROFILE
// =================================

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.redirect("/login");
        }

        res.render("pages/user/user-profile", {
            user,
            currentPage: "profile",
            success: null,
            error: null
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).send("Unable to load profile");
    }
};


// =================================
// UPDATE PROFILE NAME
// =================================

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).send("Name is required");
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.redirect("/login");
        }
        user.name = name.trim();
        await user.save();
        const updatedUser = await User.findById(user.id)
            .select("-password");

        res.render("pages/user/user-profile", {
            user: updatedUser,
            currentPage: "profile",
            success: "Profile updated successfully!",
            error: null
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).send("Unable to update profile");
    }
};


// =================================
// CHANGE PASSWORD
// =================================

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.redirect("/login");
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).send("All password fields are required");
        }

        // Verify current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).render("pages/user/user-profile", {
                user: await User.findById(user._id).select("-password"),
                success: null,
                error: "Current password is incorrect"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).render("pages/user/user-profile", {
                user: await User.findById(user._id).select("-password"),
                success: null,
                error: "New password must contain at least 6 characters"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).render("pages/user/user-profile", {
                user: await User.findById(user._id).select("-password"),
                success: null,
                error: "New passwords do not match"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).render("pages/user/user-profile", {
                user: await User.findById(user._id).select("-password"),
                success: null,
                error: "Choose a different password"
            });
        }

        // Hash and save new password
        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.render("pages/user/user-profile", {
            user: await User.findById(user._id).select("-password"),
            success: "Password changed successfully!",
            error: null
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).send("Unable to change password");
    }
};


module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
