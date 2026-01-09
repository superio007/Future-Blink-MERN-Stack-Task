const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

// Connect to database (don't exit on failure for testing)
connectDB().catch((err) => {
  console.log(
    "Database connection failed, continuing without database:",
    err.message
  );
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const aiRoutes = require("./routes/ai");

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "AI Flow Visualizer Backend API" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", aiRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "ROUTE_NOT_FOUND",
    },
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  console.error(err.stack);

  // Default error response
  const errorResponse = {
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    errorResponse.error.message = "Validation failed";
    errorResponse.error.code = "VALIDATION_ERROR";
    errorResponse.error.details = err.message;
    return res.status(400).json(errorResponse);
  }

  if (err.name === "CastError") {
    errorResponse.error.message = "Invalid data format";
    errorResponse.error.code = "CAST_ERROR";
    return res.status(400).json(errorResponse);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    errorResponse.error.message = "Invalid JSON format";
    errorResponse.error.code = "JSON_PARSE_ERROR";
    return res.status(400).json(errorResponse);
  }

  // Default to 500 server error
  res.status(500).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
