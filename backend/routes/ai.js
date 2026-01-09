const express = require("express");
const OpenRouterClient = require("../services/openRouterClient");
const PromptResponse = require("../models/PromptResponse");

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
router.post("/ask-ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate request body
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt is required",
          code: "MISSING_PROMPT",
        },
      });
    }

    if (typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt must be a string",
          code: "INVALID_PROMPT_TYPE",
        },
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt cannot be empty",
          code: "EMPTY_PROMPT",
        },
      });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt is too long (maximum 10,000 characters)",
          code: "PROMPT_TOO_LONG",
        },
      });
    }

    // Initialize OpenRouter client
    const openRouterClient = new OpenRouterClient();

    // Call OpenRouter API
    const aiResponse = await openRouterClient.chatCompletion(prompt);

    // Return response in the required format
    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error("Error in /api/ask-ai:", error.message);

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

    if (error.message.includes("Unable to connect")) {
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
router.post("/save", async (req, res) => {
  try {
    const { prompt, response } = req.body;

    // Validate request body
    if (!prompt || !response) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Both prompt and response are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    if (typeof prompt !== "string" || typeof response !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt and response must be strings",
          code: "INVALID_FIELD_TYPES",
        },
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt cannot be empty",
          code: "EMPTY_PROMPT",
        },
      });
    }

    if (response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Response cannot be empty",
          code: "EMPTY_RESPONSE",
        },
      });
    }

    if (prompt.length > 10000) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Prompt is too long (maximum 10,000 characters)",
          code: "PROMPT_TOO_LONG",
        },
      });
    }

    // Create new PromptResponse document
    const promptResponseDoc = new PromptResponse({
      prompt: prompt.trim(),
      response: response.trim(),
    });

    // Save to database
    const savedDoc = await promptResponseDoc.save();

    // Return success response with document ID
    res.status(201).json({
      success: true,
      id: savedDoc._id.toString(),
      message: "Prompt-response pair saved successfully",
    });
  } catch (error) {
    console.error("Error in /api/save:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.message,
        },
      });
    }

    // Handle database connection errors
    if (
      error.message.includes("buffering timed out") ||
      error.message.includes("connection") ||
      error.message.includes("ECONNREFUSED") ||
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
});

module.exports = router;
