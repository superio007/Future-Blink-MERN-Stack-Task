const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const {
  rateLimiter,
  requestTimeout,
  globalErrorHandler,
  notFoundHandler,
  gracefulShutdown,
} = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to database (don't exit on failure for testing)
connectDB().catch((err) => {
  logger.error("Database connection failed, continuing without database", {
    error: err.message,
    stack: err.stack,
  });
});

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Security middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Request parsing middleware with limits
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Request logging middleware
app.use(logger.logRequest.bind(logger));

// Rate limiting middleware
app.use("/api", rateLimiter);

// Request timeout middleware
app.use(requestTimeout(30000)); // 30 second timeout

// Import routes
const aiRoutes = require("./routes/ai");

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "AI Flow Visualizer Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API routes
app.use("/api", aiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
  });
});

// Setup graceful shutdown
gracefulShutdown(server);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    reason: reason,
    promise: promise,
  });
  process.exit(1);
});

module.exports = app;
