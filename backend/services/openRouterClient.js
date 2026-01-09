const https = require("https");

/**
 * OpenRouter API Client
 * Handles secure communication with OpenRouter API for AI model interactions
 */
class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = "https://openrouter.ai/api/v1";
    this.siteUrl = process.env.SITE_URL || "http://localhost:3000";

    // Free models available on OpenRouter (verified working)
    this.freeModels = ["mistralai/mistral-7b-instruct:free"];

    // Default to Mistral model (since it's working)
    this.defaultModel = this.freeModels[0];

    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
  }

  /**
   * Get the default free model
   * @returns {string} Model identifier
   */
  getDefaultModel() {
    return this.defaultModel;
  }

  /**
   * Get all available free models
   * @returns {string[]} Array of model identifiers
   */
  getAvailableModels() {
    return [...this.freeModels];
  }

  /**
   * Make a chat completion request to OpenRouter API
   * @param {string} prompt - User prompt text
   * @param {string} model - Optional model override
   * @returns {Promise<string>} AI response text
   */
  async chatCompletion(prompt, model = null) {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt is required and must be a non-empty string");
    }

    const selectedModel = model || this.defaultModel;

    if (!this.freeModels.includes(selectedModel)) {
      throw new Error(
        `Model ${selectedModel} is not available. Available models: ${this.freeModels.join(
          ", "
        )}`
      );
    }

    const requestData = {
      model: selectedModel,
      messages: [
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
    };

    try {
      const response = await this._makeRequest(
        "/chat/completions",
        requestData
      );

      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response choices received from OpenRouter API");
      }

      const aiResponse = response.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("Invalid response format from OpenRouter API");
      }

      return aiResponse;
    } catch (error) {
      console.error("OpenRouter API error:", error.message);

      // Re-throw with more specific error messages
      if (error.message.includes("401")) {
        throw new Error("Invalid OpenRouter API key");
      } else if (error.message.includes("429")) {
        throw new Error("Rate limit exceeded. Please try again later");
      } else if (error.message.includes("500")) {
        throw new Error("OpenRouter API service unavailable");
      } else if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        throw new Error("Unable to connect to OpenRouter API");
      }

      throw error;
    }
  }

  /**
   * Make HTTP request to OpenRouter API
   * @private
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request payload
   * @returns {Promise<Object>} API response
   */
  _makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        hostname: "openrouter.ai",
        port: 443,
        path: `/api/v1${endpoint}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          "HTTP-Referer": this.siteUrl,
          "X-Title": "AI Flow Visualizer",
        },
      };

      const req = https.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsedResponse = JSON.parse(responseData);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedResponse);
            } else {
              const errorMessage =
                parsedResponse.error?.message ||
                `HTTP ${res.statusCode}: ${responseData}`;
              reject(new Error(errorMessage));
            }
          } catch (parseError) {
            reject(
              new Error(
                `Failed to parse API response: ${parseError.message}. Response: ${responseData}`
              )
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      // Set timeout to 30 seconds
      req.setTimeout(30000);

      req.write(postData);
      req.end();
    });
  }
}

module.exports = OpenRouterClient;
