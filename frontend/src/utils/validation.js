/**
 * Validation utilities for user input
 */

export const validatePrompt = (prompt) => {
  const errors = [];

  if (!prompt) {
    errors.push("Prompt is required");
    return { isValid: false, errors };
  }

  if (typeof prompt !== "string") {
    errors.push("Prompt must be text");
    return { isValid: false, errors };
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length === 0) {
    errors.push("Prompt cannot be empty or contain only spaces");
    return { isValid: false, errors };
  }

  if (trimmedPrompt.length > 10000) {
    errors.push("Prompt is too long (maximum 10,000 characters)");
    return { isValid: false, errors };
  }

  if (trimmedPrompt.length < 3) {
    errors.push("Prompt must be at least 3 characters long");
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
};

export const validatePromptResponsePair = (prompt, response) => {
  const promptValidation = validatePrompt(prompt);
  if (!promptValidation.isValid) {
    return promptValidation;
  }

  if (!response) {
    return { isValid: false, errors: ["Response is required to save"] };
  }

  if (typeof response !== "string") {
    return { isValid: false, errors: ["Response must be text"] };
  }

  const trimmedResponse = response.trim();

  if (trimmedResponse.length === 0) {
    return { isValid: false, errors: ["Response cannot be empty"] };
  }

  return { isValid: true, errors: [] };
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return "";
  }

  // Remove any potentially harmful characters while preserving normal text
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .trim();
};
