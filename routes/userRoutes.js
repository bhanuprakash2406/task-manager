const express = require("express");
const router = express.Router();
const {
  getUserDashboard,
  getMyTask,
  updateTaskStatus,
  getUserTaskDetails
} = require("../controllers/userController");

const {
  getProfile,
  updateProfile,
  changePassword
} = require("../controllers/profileController");

const {
    pageAuthMiddleware,
    pageUserMiddleware
} = require("../middleware/pageAuthMiddleware");

// USER DASHBOARD
router.get(
  "/dashboard",
  pageAuthMiddleware,
  pageUserMiddleware,
  getUserDashboard
);

//GET MY TASKS
router.get(
  "/tasks",
  pageAuthMiddleware,
  pageUserMiddleware,
  getMyTask
)

// USER TASK DETAILS
router.get(
  "/tasks/:id",
  pageAuthMiddleware,
  pageUserMiddleware,
  getUserTaskDetails
);

//UPDATE TASK STATUS
router.post(
  "/tasks/:id/status",
  pageAuthMiddleware,
  pageUserMiddleware,
  updateTaskStatus
)

//USER PROFILE
router.get(
  "/profile",
  pageAuthMiddleware,
  pageUserMiddleware,
  getProfile
);

// UPDATE PROFILE
router.post(
  "/profile",
  pageAuthMiddleware,
  pageUserMiddleware,
  updateProfile
);

// CHANGE PASSWORD
router.post(
  "/change-password",
  pageAuthMiddleware,
  pageUserMiddleware,
  changePassword
);

module.exports = router;
