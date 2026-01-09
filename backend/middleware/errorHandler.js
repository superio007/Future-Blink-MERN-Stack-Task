const logger = require("../utils/logger");

/**
 * Enhanced error handling middleware
 */

/**
 * Request validation middleware
 */
const validateRequest = (requiredFields = []) => {
  return (req, res, next) => {
    try {
      // Check content type for POST requests
      if (req.method === "POST" && !req.is("application/json")) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Content-Type must be application/json",
            code: "INVALID_CONTENT_TYPE",
          },
        });
      }

      // Validate required fields
      for (const field of requiredFields) {
        if (!(field in req.body)) {
          return res.status(400).json({
            success: false,
            error: {
              message: `Missing required field: ${field}`,
              code: "MISSING_REQUIRED_FIELD",
            },
          });
        }
      }

      next();
    } catch (error) {
      logger.logError(error, req, { middleware: "validateRequest" });
      next(error);
    }
  };
};

/**
 * Rate limiting middleware
 */
const rateLimiter = (() => {
  const requests = new Map();
  const WINDOW_SIZE = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 30; // 30 requests per minute

  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - WINDOW_SIZE;

      // Get existing requests for this IP
      if (!requests.has(ip)) {
        requests.set(ip, []);
      }

      const ipRequests = requests.get(ip);

      // Remove old requests outside the window
      const recentRequests = ipRequests.filter(
        (timestamp) => timestamp > windowStart
      );
      requests.set(ip, recentRequests);

      // Check if limit exceeded
      if (recentRequests.length >= MAX_REQUESTS) {
        const resetTime = Math.ceil(
          (recentRequests[0] + WINDOW_SIZE - now) / 1000
        );

        logger.warn("Rate limit exceeded", {
          ip,
          requestCount: recentRequests.length,
          resetTime,
        });

        return res.status(429).json({
          success: false,
          error: {
            message: `Too many requests. Try again in ${resetTime} seconds`,
            code: "RATE_LIMIT_EXCEEDED",
          },
        });
      }

      // Add current request
      recentRequests.push(now);
      requests.set(ip, recentRequests);

      next();
    } catch (error) {
      logger.logError(error, req, { middleware: "rateLimiter" });
      next(error);
    }
  };
})();

/**
 * Request timeout middleware
 */
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn("Request timeout", {
          method: req.method,
          url: req.url,
          timeout: timeoutMs,
        });

        res.status(408).json({
          success: false,
          error: {
            message: "Request timeout",
            code: "REQUEST_TIMEOUT",
          },
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on("finish", () => {
      clearTimeout(timeout);
    });

    next();
  };
};

/**
 * Enhanced global error handler
 */
const globalErrorHandler = (err, req, res, next) => {
  // Log the error
  logger.logError(err, req, {
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

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
    if (process.env.NODE_ENV === "development") {
      errorResponse.error.details = err.message;
    }
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

  // Handle MongoDB connection errors
  if (
    err.name === "MongoNetworkError" ||
    err.name === "MongooseError" ||
    err.message.includes("buffering timed out") ||
    err.message.includes("connection") ||
    err.message.includes("ECONNREFUSED")
  ) {
    errorResponse.error.message = "Database temporarily unavailable";
    errorResponse.error.code = "DATABASE_UNAVAILABLE";
    return res.status(503).json(errorResponse);
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    errorResponse.error.message = "Duplicate entry detected";
    errorResponse.error.code = "DUPLICATE_ENTRY";
    return res.status(409).json(errorResponse);
  }

  // Handle custom application errors
  if (err.statusCode && err.code) {
    errorResponse.error.message = err.message;
    errorResponse.error.code = err.code;
    return res.status(err.statusCode).json(errorResponse);
  }

  // Default to 500 server error
  res.status(500).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "ROUTE_NOT_FOUND",
    },
  });
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    server.close((err) => {
      if (err) {
        logger.error("Error during server shutdown", { error: err.message });
        process.exit(1);
      }

      logger.info("Server closed successfully");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

module.exports = {
  validateRequest,
  rateLimiter,
  requestTimeout,
  globalErrorHandler,
  notFoundHandler,
  gracefulShutdown,
};
