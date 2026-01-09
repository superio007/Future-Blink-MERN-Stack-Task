const express = require("express");
const OpenRouterClient = require("../services/openRouterClient");
const PromptResponse = require("../models/PromptResponse");
const logger = require("../utils/logger");
const { validatePrompt, validateSaveData } = require("../utils/validation");
const { validateRequest } = require("../middleware/errorHandler");

const router = express.Router();

// Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "AI routes are working" });
});

/**
 * POST /api/ask-ai
 * Process AI requests securely on backend
 *
 * Request Body: { prompt: string }
 * Response Body: { response: string }
 *
 * Requirements: 4.3, 4.4
 */
router.post("/ask-ai", validateRequest(["prompt"]), async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt } = req.body;

    logger.info("AI request received", {
      promptLength: prompt ? prompt.length : 0,
      ip: req.ip,
    });

    // Validate and sanitize prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      logger.warn("Invalid prompt validation", {
        errors: validation.errors,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        error: {
          message: validation.errors[0],
          code: "INVALID_PROMPT",
        },
      });
    }

    const sanitizedPrompt = validation.sanitized;

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient();

    // Call OpenRouter API with timeout
    const aiResponse = await Promise.race([
      openRouterClient.chatCompletion(sanitizedPrompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI request timeout")), 25000)
      ),
    ]);

    const duration = Date.now() - startTime;

    logger.info("AI request completed successfully", {
      duration: `${duration}ms`,
      responseLength: aiResponse ? aiResponse.length : 0,
      ip: req.ip,
    });

    // Return response in the required format
    res.json({
      response: aiResponse,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("AI request failed", {
      error: error.message,
      duration: `${duration}ms`,
      ip: req.ip,
      stack: error.stack,
    });

    // Handle specific OpenRouter client errors
    if (error.message.includes("Invalid OpenRouter API key")) {
      return res.status(401).json({
        success: false,
        error: {
          message: "AI service authentication failed",
          code: "AI_AUTH_ERROR",
        },
      });
    }

    if (error.message.includes("Rate limit exceeded")) {
      return res.status(429).json({
        success: false,
        error: {
          message: "AI service rate limit exceeded. Please try again later",
          code: "AI_RATE_LIMIT",
        },
      });
    }

    if (
      error.message.includes("Unable to connect") ||
      error.message.includes("AI request timeout")
    ) {
      return res.status(503).json({
        success: false,
        error: {
          message: "AI service temporarily unavailable",
          code: "AI_SERVICE_UNAVAILABLE",
        },
      });
    }

    if (
      error.message.includes(
        "OPENROUTER_API_KEY environment variable is required"
      )
    ) {
      return res.status(500).json({
        success: false,
        error: {
          message: "AI service configuration error",
          code: "AI_CONFIG_ERROR",
        },
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to process AI request",
        code: "AI_PROCESSING_ERROR",
      },
    });
  }
});

/**
 * POST /api/save
 * Persist prompt-response pairs to MongoDB
 *
 * Request Body: { prompt: string, response: string }
 * Response Body: { success: boolean, id: string }
 *
 * Requirements: 4.5, 3.1, 3.2
 */
router.post(
  "/save",
  validateRequest(["prompt", "response"]),
  async (req, res) => {
    const startTime = Date.now();

    try {
      const { prompt, response } = req.body;

      logger.info("Save request received", {
        promptLength: prompt ? prompt.length : 0,
        responseLength: response ? response.length : 0,
        ip: req.ip,
      });

      // Validate and sanitize data
      const validation = validateSaveData(prompt, response);
      if (!validation.isValid) {
        logger.warn("Invalid save data validation", {
          errors: validation.errors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: {
            message: validation.errors[0],
            code: "INVALID_SAVE_DATA",
          },
        });
      }

      // Create new PromptResponse document with sanitized data
      const promptResponseDoc = new PromptResponse({
        prompt: validation.sanitizedPrompt,
        response: validation.sanitizedResponse,
      });

      // Save to database with timeout
      const savedDoc = await Promise.race([
        promptResponseDoc.save(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database save timeout")), 10000)
        ),
      ]);

      const duration = Date.now() - startTime;

      logger.info("Save request completed successfully", {
        duration: `${duration}ms`,
        documentId: savedDoc._id.toString(),
        ip: req.ip,
      });

      // Return success response with document ID
      res.status(201).json({
        success: true,
        id: savedDoc._id.toString(),
        message: "Prompt-response pair saved successfully",
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("Save request failed", {
        error: error.message,
        duration: `${duration}ms`,
        ip: req.ip,
        stack: error.stack,
      });

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          },
        });
      }

      // Handle database connection errors
      if (
        error.message.includes("buffering timed out") ||
        error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("Database save timeout") ||
        error.name === "MongooseError" ||
        error.message.includes("MongooseError") ||
        error.message.includes("MongoNetworkError") ||
        error.message.includes("topology")
      ) {
        return res.status(503).json({
          success: false,
          error: {
            message: "Database temporarily unavailable",
            code: "DATABASE_UNAVAILABLE",
          },
        });
      }

      // Handle duplicate key errors (if any unique indexes exist)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: {
            message: "Duplicate entry detected",
            code: "DUPLICATE_ENTRY",
          },
        });
      }

      // Generic database error
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to save prompt-response pair",
          code: "DATABASE_ERROR",
        },
      });
    }
  }
);

module.exports = router;
