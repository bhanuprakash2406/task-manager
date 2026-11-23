const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const pageRoutes = require("./routes/pageRoutes");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// EJS configuration
app.set("view engine", "ejs");
app.set(
  "views",
  path.join(__dirname, "views")
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Read form data
app.use(express.urlencoded({ extended: true }));

// User route
app.use("/user", userRoutes);

// Admin route
app.use("/admin", adminRoutes);

// Page route
app.use("/",pageRoutes)

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    // Server port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
startServer();