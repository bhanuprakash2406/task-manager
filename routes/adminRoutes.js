const express = require("express");
const router = express.Router();

const {
    statistics,
    createTask,
    updateTask,
    getEditTask,
    deleteTask,
    getTaskPage,
    getAllUsers,
    deleteUser,
    filterTasks
} = require("../controllers/adminController")

const {
    pageAuthMiddleware,
    pageAdminMiddleware
} = require("../middleware/pageAuthMiddleware");

// ADMIN DASHBOARD - ANALYTICS
router.get(
    "/dashboard",
    pageAuthMiddleware,
    pageAdminMiddleware,
    statistics
);

// GET ALL TASKS WITH FILTERS
router.get(
    "/tasks",
    pageAuthMiddleware,
    pageAdminMiddleware,
    filterTasks
);

// CREATE TASK - GET PAGE
router.get(
    "/create-task",
    pageAuthMiddleware,
    pageAdminMiddleware,
    getTaskPage
);

// CREATE TASK - POST 
router.post(
    "/create-task",
    pageAuthMiddleware,
    pageAdminMiddleware,
    createTask
);

// EDIT TASK - GET PAGE
router.get(
    "/tasks/:id/edit",
    pageAuthMiddleware,
    pageAdminMiddleware,
    getEditTask
);

// EDIT TASK - UPDATE
router.post(
    "/tasks/:id/edit",
    pageAuthMiddleware,
    pageAdminMiddleware,
    updateTask
);

// DELETE TASK
router.post(
    "/tasks/:id/delete",
    pageAuthMiddleware,
    pageAdminMiddleware,
    deleteTask
);

// GET ALL REGISTERED USERS
router.get(
    "/users",
    pageAuthMiddleware,
    pageAdminMiddleware,
    getAllUsers
);

// DELETE USER
router.post(
    "/users/:id/delete",
    pageAuthMiddleware,
    pageAdminMiddleware,
    deleteUser
);

module.exports = router;
