/**
 * Backend validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent potential security issues
 */
const sanitizeString = (input) => {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .trim();
};

/**
 * Validate prompt input
 */
const validatePrompt = (prompt) => {
  const errors = [];

  if (!prompt) {
    errors.push("Prompt is required");
    return { isValid: false, errors };
  }

  if (typeof prompt !== "string") {
    errors.push("Prompt must be a string");
    return { isValid: false, errors };
  }

  const sanitized = sanitizeString(prompt);

  if (sanitized.length === 0) {
    errors.push("Prompt cannot be empty");
    return { isValid: false, errors };
  }

  if (sanitized.length < 3) {
    errors.push("Prompt must be at least 3 characters long");
    return { isValid: false, errors };
  }

  if (sanitized.length > 10000) {
    errors.push("Prompt is too long (maximum 10,000 characters)");
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitized };
};

/**
 * Validate save request data
 */
const validateSaveData = (prompt, response) => {
  const errors = [];

  // Validate prompt
  const promptValidation = validatePrompt(prompt);
  if (!promptValidation.isValid) {
    errors.push(...promptValidation.errors);
  }

  // Validate response
  if (!response) {
    errors.push("Response is required");
  } else if (typeof response !== "string") {
    errors.push("Response must be a string");
  } else {
    const sanitizedResponse = sanitizeString(response);
    if (sanitizedResponse.length === 0) {
      errors.push("Response cannot be empty");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedPrompt: promptValidation.sanitized || "",
    sanitizedResponse: response ? sanitizeString(response) : "",
  };
};

/**
 * Validate request body structure
 */
const validateRequestBody = (body, requiredFields = []) => {
  const errors = [];

  if (!body || typeof body !== "object") {
    errors.push("Request body must be a valid JSON object");
    return { isValid: false, errors };
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Rate limiting validation
 */
const createRateLimiter = () => {
  const requests = new Map();
  const WINDOW_SIZE = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 30; // 30 requests per minute

  return (ip) => {
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
      return {
        allowed: false,
        resetTime: Math.ceil((recentRequests[0] + WINDOW_SIZE - now) / 1000),
      };
    }

    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);

    return { allowed: true };
  };
};

module.exports = {
  sanitizeString,
  validatePrompt,
  validateSaveData,
  validateRequestBody,
  createRateLimiter,
};
