const User = require("../models/User");
const Task = require("../models/Task");
const mongoose = require("mongoose");

const getUserDashboard = async (req, res) => {
  try {
    const id = req.user.id
    const user = await User.findById({ _id: id })
    const tasks = await Task.find({
      assignedTo: user._id
    }).sort({ createdAt: -1 });
    const statistics = {
      total: tasks.length,

      pending: tasks.filter(
        task => task.status === "pending"
      ).length,

      inProgress: tasks.filter(
        task => task.status === "in-progress"
      ).length,

      completed: tasks.filter(
        task => task.status === "completed"
      ).length
    };

    return res.render("pages/user/user-dashboard", {
      currentUser: user,
      currentPage: "dashboard",
      tasks,
      statistics
    });

  } catch (error) {
    console.error("User dashboard error:", error);
    res.status(500).send("Unable to load user dashboard");
  }
}

const getMyTask = async (req, res) => {
  try {
    const id = req.user.id
    const user = await User.findById({ _id: id })
    const tasks = await Task.find({
      assignedTo: user._id
    }).sort({ createdAt: -1 });

    res.render("pages/user/my-tasks", {
      currentUser: user,
      currentPage: "tasks",
      tasks
    });

  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).send("Unable to load your tasks");
  }
}

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate task ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid task ID");
    }

    // 2. Validate status
    const allowedStatuses = [
      "pending",
      "in-progress",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid task status");
    }

    // 3. Update logged-in user's task
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: id,
        assignedTo: req.user.id
      },
      {
        $set: { status }
      },
      {
        new: true,
        runValidators: true
      }
    );

    // 4. Check task existence
    if (!updatedTask) {
      return res.status(404).send(
        "Task not found or you are not authorized"
      );
    }

    // 5. Redirect
    return res.redirect("/user/tasks");

  } catch (error) {
    console.error("Update task status error:", error);
    return res.status(500).send(
      "Unable to update task status"
    );
  }
};

// GET USER TASK DETAILS
const getUserTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id
    const user = await User.findById({_id:user_id})
    // Validate task ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid task ID");
    }
    // Find task belonging to logged-in user
    const task = await Task.findOne({
      _id: id,
      assignedTo: req.user.id
    })
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.render("pages/user/task-details", { 
      currentUser:user,
      currentPage: "tasks",
      task });
  } catch (error) {
    console.error("Get User Task Details Error:", error);
    res.status(500).send("Unable to load task details");
  }
};


module.exports = {
  getUserDashboard,
  getMyTask,
  updateTaskStatus,
  getUserTaskDetails
};
