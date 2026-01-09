const http = require("http");
const https = require("https");
require("dotenv").config();

/**
 * Comprehensive End-to-End Test Suite
 * Tests complete user journey from input to save with both AI models
 * Validates all error scenarios work correctly
 *
 * Requirements: All requirements (1.1-6.5)
 */

class E2ETestSuite {
  constructor() {
    this.baseUrl = "http://localhost:5000";
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Log test result
   */
  logResult(testName, passed, message = "", details = null) {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName}: PASSED ${message ? `- ${message}` : ""}`);
    } else {
      this.failedTests++;
      console.log(`❌ ${testName}: FAILED ${message ? `- ${message}` : ""}`);
      if (details) {
        console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
      }
    }

    this.testResults.push({
      name: testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Make HTTP request helper
   */
  makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsedData = data ? JSON.parse(data) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData,
              rawData: data,
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data,
              parseError: e.message,
            });
          }
        });
      });

      req.on("error", (e) => {
        reject(e);
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  /**
   * Test server health and basic connectivity
   */
  async testServerHealth() {
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/health",
        method: "GET",
      };

      const response = await this.makeRequest(options);

      if (response.statusCode === 200 && response.data.status === "OK") {
        this.logResult(
          "Server Health Check",
          true,
          "Server is running and healthy"
        );
        return true;
      } else {
        this.logResult(
          "Server Health Check",
          false,
          `Unexpected response: ${response.statusCode}`,
          response.data
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        "Server Health Check",
        false,
        `Connection failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test complete user journey: Input -> AI Processing -> Save
   */
  async testCompleteUserJourney() {
    const testPrompt =
      "What is the capital of France? Please provide a brief answer.";
    let aiResponse = null;

    try {
      // Step 1: Test AI processing endpoint
      const aiOptions = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const aiPostData = JSON.stringify({ prompt: testPrompt });
      const aiResult = await this.makeRequest(aiOptions, aiPostData);

      if (aiResult.statusCode === 200 && aiResult.data.response) {
        aiResponse = aiResult.data.response;
        this.logResult(
          "AI Processing Step",
          true,
          `Received response (${aiResponse.length} chars)`
        );
      } else {
        this.logResult(
          "AI Processing Step",
          false,
          `AI request failed: ${aiResult.statusCode}`,
          aiResult.data
        );
        return false;
      }

      // Step 2: Test save endpoint with the AI response
      const saveOptions = {
        hostname: "localhost",
        port: 5000,
        path: "/api/save",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const savePostData = JSON.stringify({
        prompt: testPrompt,
        response: aiResponse,
      });

      const saveResult = await this.makeRequest(saveOptions, savePostData);

      if (saveResult.statusCode === 201 && saveResult.data.success) {
        this.logResult(
          "Data Persistence Step",
          true,
          `Saved with ID: ${saveResult.data.id}`
        );
        this.logResult(
          "Complete User Journey",
          true,
          "Full workflow completed successfully"
        );
        return true;
      } else {
        this.logResult(
          "Data Persistence Step",
          false,
          `Save failed: ${saveResult.statusCode}`,
          saveResult.data
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        "Complete User Journey",
        false,
        `Journey failed: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test AI model functionality (currently only Mistral is configured)
   */
  async testAIModels() {
    const testPrompt = "Hello, please respond with 'AI model test successful'.";

    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({ prompt: testPrompt });
      const response = await this.makeRequest(options, postData);

      if (response.statusCode === 200 && response.data.response) {
        this.logResult(
          "Mistral AI Model",
          true,
          `Response received: "${response.data.response.substring(0, 50)}..."`
        );

        // Test response format consistency (Requirement 4.4)
        if (typeof response.data.response === "string") {
          this.logResult(
            "API Response Format",
            true,
            "Response format is consistent (string)"
          );
        } else {
          this.logResult(
            "API Response Format",
            false,
            "Response format is not a string",
            typeof response.data.response
          );
        }

        return true;
      } else {
        this.logResult(
          "Mistral AI Model",
          false,
          `Model test failed: ${response.statusCode}`,
          response.data
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        "AI Models Test",
        false,
        `Model test error: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test error scenarios and edge cases
   */
  async testErrorScenarios() {
    let allPassed = true;

    // Test 1: Empty prompt validation
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({ prompt: "" });
      const response = await this.makeRequest(options, postData);

      if (response.statusCode === 400) {
        this.logResult(
          "Empty Prompt Validation",
          true,
          "Correctly rejected empty prompt"
        );
      } else {
        this.logResult(
          "Empty Prompt Validation",
          false,
          `Expected 400, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Empty Prompt Validation",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 2: Missing prompt field
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({});
      const response = await this.makeRequest(options, postData);

      if (response.statusCode === 400) {
        this.logResult(
          "Missing Prompt Field",
          true,
          "Correctly rejected missing prompt"
        );
      } else {
        this.logResult(
          "Missing Prompt Field",
          false,
          `Expected 400, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Missing Prompt Field",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 3: Invalid JSON
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await this.makeRequest(options, "invalid json");

      if (response.statusCode === 400) {
        this.logResult(
          "Invalid JSON Handling",
          true,
          "Correctly rejected invalid JSON"
        );
      } else {
        this.logResult(
          "Invalid JSON Handling",
          false,
          `Expected 400, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Invalid JSON Handling",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 4: Save endpoint validation - empty prompt
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/save",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({
        prompt: "",
        response: "Some response",
      });
      const response = await this.makeRequest(options, postData);

      if (response.statusCode === 400) {
        this.logResult(
          "Save Empty Prompt Validation",
          true,
          "Correctly rejected empty prompt for save"
        );
      } else {
        this.logResult(
          "Save Empty Prompt Validation",
          false,
          `Expected 400, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Save Empty Prompt Validation",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 5: Save endpoint validation - missing fields
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/save",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({
        prompt: "Test prompt",
        // Missing response field
      });
      const response = await this.makeRequest(options, postData);

      if (response.statusCode === 400) {
        this.logResult(
          "Save Missing Fields Validation",
          true,
          "Correctly rejected missing response field"
        );
      } else {
        this.logResult(
          "Save Missing Fields Validation",
          false,
          `Expected 400, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Save Missing Fields Validation",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 6: Non-existent endpoint
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/nonexistent",
        method: "GET",
      };

      const response = await this.makeRequest(options);

      if (response.statusCode === 404) {
        this.logResult(
          "404 Error Handling",
          true,
          "Correctly returned 404 for non-existent endpoint"
        );
      } else {
        this.logResult(
          "404 Error Handling",
          false,
          `Expected 404, got ${response.statusCode}`,
          response.data
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "404 Error Handling",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    return allPassed;
  }

  /**
   * Test security requirements
   */
  async testSecurityRequirements() {
    let allPassed = true;

    // Test 1: Verify API key is not exposed in responses
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({ prompt: "Tell me about API keys" });
      const response = await this.makeRequest(options, postData);

      const responseStr = JSON.stringify(response);
      const hasApiKey = responseStr.includes(
        process.env.OPENROUTER_API_KEY || ""
      );

      if (!hasApiKey) {
        this.logResult(
          "API Key Security",
          true,
          "API key not exposed in response"
        );
      } else {
        this.logResult(
          "API Key Security",
          false,
          "API key found in response - security breach!"
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult("API Key Security", false, `Test error: ${error.message}`);
      allPassed = false;
    }

    // Test 2: Verify CORS headers are present
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/test",
        method: "GET",
      };

      const response = await this.makeRequest(options);

      if (response.headers["access-control-allow-origin"]) {
        this.logResult("CORS Headers", true, "CORS headers are present");
      } else {
        this.logResult("CORS Headers", false, "CORS headers missing");
        allPassed = false;
      }
    } catch (error) {
      this.logResult("CORS Headers", false, `Test error: ${error.message}`);
      allPassed = false;
    }

    return allPassed;
  }

  /**
   * Test data persistence and database operations
   */
  async testDataPersistence() {
    const testPrompt = "Test prompt for persistence validation";
    const testResponse = "Test response for persistence validation";

    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/save",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const postData = JSON.stringify({
        prompt: testPrompt,
        response: testResponse,
      });

      const response = await this.makeRequest(options, postData);

      if (
        response.statusCode === 201 &&
        response.data.success &&
        response.data.id
      ) {
        this.logResult(
          "Data Persistence",
          true,
          `Successfully saved with ID: ${response.data.id}`
        );

        // Verify response format
        if (
          typeof response.data.id === "string" &&
          response.data.id.length > 0
        ) {
          this.logResult(
            "Save Response Format",
            true,
            "Save response includes valid ID"
          );
        } else {
          this.logResult(
            "Save Response Format",
            false,
            "Save response ID format invalid",
            response.data
          );
        }

        return true;
      } else {
        this.logResult(
          "Data Persistence",
          false,
          `Save failed: ${response.statusCode}`,
          response.data
        );
        return false;
      }
    } catch (error) {
      this.logResult(
        "Data Persistence",
        false,
        `Persistence test error: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test environment configuration
   */
  async testEnvironmentConfiguration() {
    let allPassed = true;

    // Check required environment variables
    const requiredEnvVars = ["OPENROUTER_API_KEY", "MONGODB_URI"];

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.logResult(
          `Environment Variable: ${envVar}`,
          true,
          "Present and configured"
        );
      } else {
        this.logResult(
          `Environment Variable: ${envVar}`,
          false,
          "Missing or not configured"
        );
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("🚀 Starting Comprehensive End-to-End Test Suite");
    console.log("=".repeat(60));

    const startTime = Date.now();

    // Test 1: Server Health
    console.log("\n📋 Testing Server Health...");
    const healthPassed = await this.testServerHealth();

    if (!healthPassed) {
      console.log(
        "\n❌ Server health check failed. Cannot continue with other tests."
      );
      this.printSummary();
      return false;
    }

    // Test 2: Environment Configuration
    console.log("\n🔧 Testing Environment Configuration...");
    await this.testEnvironmentConfiguration();

    // Test 3: Complete User Journey
    console.log("\n🔄 Testing Complete User Journey...");
    await this.testCompleteUserJourney();

    // Test 4: AI Models
    console.log("\n🤖 Testing AI Models...");
    await this.testAIModels();

    // Test 5: Error Scenarios
    console.log("\n⚠️  Testing Error Scenarios...");
    await this.testErrorScenarios();

    // Test 6: Security Requirements
    console.log("\n🔒 Testing Security Requirements...");
    await this.testSecurityRequirements();

    // Test 7: Data Persistence
    console.log("\n💾 Testing Data Persistence...");
    await this.testDataPersistence();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log("\n" + "=".repeat(60));
    console.log(`⏱️  Total test duration: ${duration}ms`);

    this.printSummary();

    return this.failedTests === 0;
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log("\n📊 TEST SUMMARY");
    console.log("=".repeat(30));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(
      `Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(
        1
      )}%`
    );

    if (this.failedTests > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`   - ${result.name}: ${result.message}`);
        });
    }

    console.log(
      "\n" +
        (this.failedTests === 0
          ? "🎉 ALL TESTS PASSED!"
          : "⚠️  SOME TESTS FAILED")
    );
  }
}

// Run the test suite
async function main() {
  const testSuite = new E2ETestSuite();

  try {
    const allPassed = await testSuite.runAllTests();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("❌ Test suite crashed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = E2ETestSuite;
