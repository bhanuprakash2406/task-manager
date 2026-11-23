const User = require("../models/User");
const Task = require("../models/Task");
const mongoose = require("mongoose");

const statistics = async (req, res) => {
    try {
        // Fetch all statistics together
        const [
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            totalUsers,
            lowPriorityTasks,
            mediumPriorityTasks,
            highPriorityTasks,
            recentTasks
        ] = await Promise.all([

            Task.countDocuments(),
            Task.countDocuments({ status: "pending" }),
            Task.countDocuments({ status: "in-progress" }),
            Task.countDocuments({ status: "completed" }),
            User.countDocuments({ role: "user" }),
            Task.countDocuments({ priority: "low" }),
            Task.countDocuments({ priority: "medium" }),
            Task.countDocuments({ priority: "high" }),
            Task.find()
                .populate("assignedTo", "name email")
                .populate("assignedBy", "name")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);
        // Completion percentage
        const completionRate = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;
        // Dashboard data
        res.render("pages/admin/admin-dashboard", {
            statistics: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                totalUsers,
                completionRate
            },
            priorityStats: {
                low: lowPriorityTasks,
                medium: mediumPriorityTasks,
                high: highPriorityTasks
            },
            currentPage: "dashboard",
            tasks: recentTasks
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).send("Unable to load admin dashboard");
    }
}

// create task 
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate
    } = req.body;
    // Validate required fields
    if (
      !title?.trim() ||
      !assignedTo ||
      !priority ||
      !dueDate ||
      !["low", "medium", "high"].includes(priority) ||
      Number.isNaN(new Date(dueDate).getTime())
    ) {
      const users = await User.find({ role: "user" })
        .select("name email");
      return res.status(400).render("pages/admin/create-task", {
        users,
        currentPage: "createTask",
        error: "Please fill in all required fields",
        success: null
      });
    }
    // Find assigned user
    const user = await User.findOne({
      email: assignedTo.trim().toLowerCase(),
      role: "user"
    });
    if (!user) {
      const users = await User.find({ role: "user" })
        .select("name email");
      return res.status(404).render("pages/admin/create-task", {
        users,
        currentPage: "createTask",
        error: "Selected user not found",
        success: null
      });
    }
    // Create task
    await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      assignedTo: user._id,
      assignedBy: req.user._id,
      priority,
      dueDate: dueDate || undefined
    });
    return res.redirect("/admin/tasks?created=true");
  } catch (error) {
    console.error("Create task error:", error);
    const users = await User.find({ role: "user" })
      .select("name email");
    return res.status(500).render("pages/admin/create-task", {
      users,
      currentPage: "createTask",
      error: "Unable to create task. Please try again.",
      success: null
    });
  }
};

// update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      status
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid task ID");
    }

    if (!title?.trim() || !assignedTo || !priority) {
      return res.status(400).send(
        "Please fill all required fields"
      );
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).send("Invalid priority");
    }

    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).send("Invalid status");
    }

    const parsedDueDate = new Date(dueDate);

    if (!dueDate || Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).send("A valid due date is required");
    }

    const user = await User.findOne({
      email: assignedTo.trim().toLowerCase(),
      role: "user"
    });

    if (!user) {
      return res.status(400).send("Assigned user not found");
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send("Task not found");
    }

    task.title = title.trim();
    task.description = description || "";
    task.assignedTo = user._id;
    task.priority = priority;
    task.dueDate = parsedDueDate;
    task.status = status;

    // Preserve task status and original creator
    await task.save();

    return res.redirect("/admin/tasks?updated=true");

  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).send("Unable to update task");
  }
}

// Edit task page
const getEditTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid task ID");
    }
    const [task, users] = await Promise.all([
      Task.findById(id).populate("assignedTo", "name email"),
      User.find({ role: "user" }).select("name email")
    ]);
    if (!task) {
      return res.status(404).send("Task not found");
    }
    return res.render("pages/admin/edit-task", {
      task,
      users,
      currentPage: "task",
      error: null
    });

  } catch (error) {
    console.error("Load edit task page error:", error);
    return res.status(500).send("Unable to load edit task page");
  }
}

// delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid task ID");
    }
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).send("Task not found");
    }
    res.redirect("/admin/tasks?deleted=true");
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).send("Unable to delete task");
  }
};

const getTaskPage = async (req, res) => {
    try {
        const users = await User.find({
            role: "user"
        }).select("name email");
        res.render("pages/admin/create-task", {
            users,
            currentPage: "createTask",
            error: null,
            success: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load users");
    }
}
const getAllUsers = async (req, res) => {
    try {
        // Fetch registered users
        const users = await User.find({
            role: "user"
        })
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        // Get task counts for all users
        const taskCounts = await Task.aggregate([
            {
                $group: {
                    _id: "$assignedTo",
                    totalTasks: { $sum: 1 }
                }
            }
        ]);

        // Map task counts to users
        const countMap = new Map(
            taskCounts.map(item => [
                item._id.toString(),
                item.totalTasks
            ])
        );

        const usersWithTaskCount = users.map(user => ({
            ...user,
            taskCount: countMap.get(user._id.toString()) || 0
        }));

        res.render("pages/admin/admin-users", {
            users: usersWithTaskCount,
            currentPage: "user",
            success: req.query.deleted
                ? "User and assigned tasks deleted successfully!"
                : null
        });

    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).send("Unable to load users");
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid user ID");
        }

        // Find user
        const user = await User.findById(id);
        if (!user || user.role !== "user") {
            return res.status(404).send("User not found");
        }

        // Delete assigned tasks
        await Task.deleteMany({
            assignedTo: user._id
        });

        // Delete user
        await User.findByIdAndDelete(id);
        return res.redirect("/admin/users?deleted=true");

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).send("Unable to delete user");
    }
};

const filterTasks = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      priority = "",
      assignedTo = ""
    } = req.query;
    const filter = {};
    // Search by title
    if (search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = {
        $regex: escapedSearch,
        $options: "i"
      };
    }

    // Status filter
    if (["pending", "in-progress", "completed"].includes(status)) {
      filter.status = status;
    }
    // Priority filter
    if (["low", "medium", "high"].includes(priority)) {
      filter.priority = priority;
    }

    // Assigned user filter
    if (
      assignedTo &&
      mongoose.isValidObjectId(assignedTo)
    ) {
      filter.assignedTo = assignedTo;
    }

    // Fetch filtered tasks
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    // Fetch users for dropdown
    const users = await User.find({
      role: "user"
    }).select("name email");

    res.render("pages/admin/admin-tasks", {
      tasks: tasks || [],
      users: users || [],

      filters: {
        search: req.query.search || "",
        status: req.query.status || "",
        priority: req.query.priority || "",
        assignedTo: req.query.assignedTo || ""
      },

      currentPage: "task",

      success: req.query.created
        ? "Task created and assigned successfully!"
        : req.query.deleted
          ? "Task deleted successfully!"
          : req.query.updated
            ? "Task updated successfully!"
            : null
    });

  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).send("Unable to load tasks");
  }
}

module.exports = {
    statistics,
    createTask,
    updateTask,
    getEditTask,
    deleteTask,
    getTaskPage,
    getAllUsers,
    deleteUser,
    filterTasks
}