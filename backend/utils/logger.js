const fs = require("fs");
const path = require("path");

/**
 * Simple logging utility for the application
 */
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, "../logs");
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error("Failed to create logs directory:", error.message);
      }
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, message) {
    try {
      const logFile = path.join(this.logDir, filename);
      fs.appendFileSync(logFile, message + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error.message);
    }
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage("INFO", message, meta);
    console.log(formattedMessage);
    this.writeToFile("app.log", formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage("WARN", message, meta);
    console.warn(formattedMessage);
    this.writeToFile("app.log", formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage("ERROR", message, meta);
    console.error(formattedMessage);
    this.writeToFile("error.log", formattedMessage);
    this.writeToFile("app.log", formattedMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      const formattedMessage = this.formatMessage("DEBUG", message, meta);
      console.debug(formattedMessage);
      this.writeToFile("debug.log", formattedMessage);
    }
  }

  // Log API requests
  logRequest(req, res, next) {
    const start = Date.now();
    const { method, url, ip, headers } = req;

    this.info("API Request", {
      method,
      url,
      ip,
      userAgent: headers["user-agent"],
      contentType: headers["content-type"],
    });

    // Log response when it finishes
    res.on("finish", () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      this.info("API Response", {
        method,
        url,
        statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }

  // Log errors with stack trace
  logError(error, req = null, additionalInfo = {}) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...additionalInfo,
    };

    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      };
    }

    this.error("Application Error", errorInfo);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
