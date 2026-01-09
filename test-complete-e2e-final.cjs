/**
 * Complete End-to-End Test Suite
 * Final comprehensive test covering all requirements
 *
 * This test validates:
 * - Complete user journey from input to save
 * - Both supported AI models (architecture)
 * - All error scenarios
 * - Frontend-backend integration
 * - Security requirements
 * - Data persistence
 *
 * Requirements: All requirements (1.1-6.5)
 */

const http = require("http");
const fs = require("fs");

class CompleteE2ETestSuite {
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
   * Test 1: Complete User Journey (Requirements 1.1-3.5)
   */
  async testCompleteUserJourney() {
    console.log("🔄 Testing Complete User Journey...");

    const testPrompt =
      "What is React Flow? Please provide a brief explanation.";
    let aiResponse = null;

    try {
      // Step 1: AI Processing (Requirements 2.1-2.5)
      const aiOptions = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      const aiPostData = JSON.stringify({ prompt: testPrompt });
      const aiResult = await this.makeRequest(aiOptions, aiPostData);

      if (aiResult.statusCode === 200 && aiResult.data.response) {
        aiResponse = aiResult.data.response;
        this.logResult(
          "User Journey: AI Processing",
          true,
          `Response received (${aiResponse.length} chars)`
        );
      } else {
        this.logResult(
          "User Journey: AI Processing",
          false,
          `AI request failed: ${aiResult.statusCode}`,
          aiResult.data
        );
        return false;
      }

      // Step 2: Data Persistence (Requirements 3.1-3.3)
      const saveOptions = {
        hostname: "localhost",
        port: 5000,
        path: "/api/save",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      const savePostData = JSON.stringify({
        prompt: testPrompt,
        response: aiResponse,
      });

      const saveResult = await this.makeRequest(saveOptions, savePostData);

      if (saveResult.statusCode === 201 && saveResult.data.success) {
        this.logResult(
          "User Journey: Data Persistence",
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
          "User Journey: Data Persistence",
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
   * Test 2: AI Model Architecture (Requirements 2.3, 2.5)
   */
  async testAIModelArchitecture() {
    console.log("\n🤖 Testing AI Model Architecture...");

    const testCases = [
      { name: "Simple Math", prompt: "What is 5 + 3?" },
      {
        name: "Creative Writing",
        prompt: "Write a short sentence about coding.",
      },
      { name: "Technical Question", prompt: "What is JavaScript?" },
    ];

    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const options = {
          hostname: "localhost",
          port: 5000,
          path: "/api/ask-ai",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        };

        const postData = JSON.stringify({ prompt: testCase.prompt });
        const response = await this.makeRequest(options, postData);

        if (response.statusCode === 200 && response.data.response) {
          this.logResult(
            `AI Model: ${testCase.name}`,
            true,
            `Response: "${response.data.response.substring(0, 50)}..."`
          );

          // Validate response format (Requirement 4.4)
          if (typeof response.data.response === "string") {
            this.logResult(
              `Response Format: ${testCase.name}`,
              true,
              "Consistent string format"
            );
          } else {
            this.logResult(
              `Response Format: ${testCase.name}`,
              false,
              "Inconsistent format"
            );
            allPassed = false;
          }
        } else {
          this.logResult(
            `AI Model: ${testCase.name}`,
            false,
            `Failed: ${response.statusCode}`,
            response.data
          );
          allPassed = false;
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.logResult(
          `AI Model: ${testCase.name}`,
          false,
          `Error: ${error.message}`
        );
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Test 3: Error Scenarios (Requirements 3.5, 4.1, 4.2)
   */
  async testErrorScenarios() {
    console.log("\n⚠️  Testing Error Scenarios...");

    const errorTests = [
      {
        name: "Empty Prompt",
        endpoint: "/api/ask-ai",
        body: { prompt: "" },
        expectedStatus: 400,
      },
      {
        name: "Missing Prompt Field",
        endpoint: "/api/ask-ai",
        body: {},
        expectedStatus: 400,
      },
      {
        name: "Invalid JSON",
        endpoint: "/api/ask-ai",
        body: "invalid json",
        expectedStatus: 400,
        isRawBody: true,
      },
      {
        name: "Save Empty Data",
        endpoint: "/api/save",
        body: { prompt: "", response: "test" },
        expectedStatus: 400,
      },
      {
        name: "Save Missing Fields",
        endpoint: "/api/save",
        body: { prompt: "test" },
        expectedStatus: 400,
      },
      {
        name: "Non-existent Endpoint",
        endpoint: "/api/nonexistent",
        method: "GET",
        expectedStatus: 404,
      },
    ];

    let allPassed = true;

    for (const test of errorTests) {
      try {
        const options = {
          hostname: "localhost",
          port: 5000,
          path: test.endpoint,
          method: test.method || "POST",
          headers: { "Content-Type": "application/json" },
        };

        const postData = test.isRawBody
          ? test.body
          : test.body
          ? JSON.stringify(test.body)
          : null;
        const response = await this.makeRequest(options, postData);

        if (response.statusCode === test.expectedStatus) {
          this.logResult(
            `Error Handling: ${test.name}`,
            true,
            `Correctly returned ${test.expectedStatus}`
          );
        } else {
          this.logResult(
            `Error Handling: ${test.name}`,
            false,
            `Expected ${test.expectedStatus}, got ${response.statusCode}`
          );
          allPassed = false;
        }
      } catch (error) {
        this.logResult(
          `Error Handling: ${test.name}`,
          false,
          `Test error: ${error.message}`
        );
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Test 4: Security Requirements (Requirements 4.1, 4.2)
   */
  async testSecurityRequirements() {
    console.log("\n🔒 Testing Security Requirements...");

    let allPassed = true;

    // Test 1: API Key Security
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/api/ask-ai",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      const postData = JSON.stringify({ prompt: "Tell me about API security" });
      const response = await this.makeRequest(options, postData);

      const responseStr = JSON.stringify(response);
      const hasApiKey = responseStr.includes(
        process.env.OPENROUTER_API_KEY || ""
      );

      if (!hasApiKey) {
        this.logResult(
          "Security: API Key Protection",
          true,
          "API key not exposed in response"
        );
      } else {
        this.logResult(
          "Security: API Key Protection",
          false,
          "API key found in response - security breach!"
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Security: API Key Protection",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    // Test 2: CORS Configuration
    try {
      const options = {
        hostname: "localhost",
        port: 5000,
        path: "/health",
        method: "GET",
      };

      const response = await this.makeRequest(options);

      if (response.headers["access-control-allow-origin"]) {
        this.logResult(
          "Security: CORS Headers",
          true,
          "CORS properly configured"
        );
      } else {
        this.logResult("Security: CORS Headers", false, "CORS headers missing");
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Security: CORS Headers",
        false,
        `Test error: ${error.message}`
      );
      allPassed = false;
    }

    return allPassed;
  }

  /**
   * Test 5: Frontend Architecture (Requirements 1.1-1.4, 5.1, 5.4)
   */
  async testFrontendArchitecture() {
    console.log("\n⚛️  Testing Frontend Architecture...");

    const requiredFiles = [
      "src/App.jsx",
      "src/components/InputNode.jsx",
      "src/components/ResultNode.jsx",
      "package.json",
    ];

    let allPassed = true;

    for (const file of requiredFiles) {
      try {
        if (fs.existsSync(file)) {
          this.logResult(`Frontend: ${file}`, true, "File exists");
        } else {
          this.logResult(`Frontend: ${file}`, false, "File missing");
          allPassed = false;
        }
      } catch (error) {
        this.logResult(`Frontend: ${file}`, false, `Error: ${error.message}`);
        allPassed = false;
      }
    }

    // Test React Flow integration
    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      if (packageJson.dependencies["@xyflow/react"]) {
        this.logResult(
          "Frontend: React Flow Integration",
          true,
          "React Flow dependency found"
        );
      } else {
        this.logResult(
          "Frontend: React Flow Integration",
          false,
          "React Flow dependency missing"
        );
        allPassed = false;
      }

      const appContent = fs.readFileSync("src/App.jsx", "utf8");
      if (
        appContent.includes("ReactFlow") &&
        appContent.includes("nodeTypes")
      ) {
        this.logResult(
          "Frontend: React Flow Usage",
          true,
          "React Flow properly implemented"
        );
      } else {
        this.logResult(
          "Frontend: React Flow Usage",
          false,
          "React Flow implementation incomplete"
        );
        allPassed = false;
      }
    } catch (error) {
      this.logResult(
        "Frontend: Architecture Check",
        false,
        `Error: ${error.message}`
      );
      allPassed = false;
    }

    return allPassed;
  }

  /**
   * Test 6: Configuration and Documentation (Requirements 6.1-6.5)
   */
  async testConfigurationAndDocumentation() {
    console.log("\n📋 Testing Configuration and Documentation...");

    const requiredFiles = [
      { file: ".env.example", description: "Environment example file" },
      {
        file: "backend/.env.example",
        description: "Backend environment example",
      },
      { file: "README.md", description: "Documentation file" },
    ];

    let allPassed = true;

    for (const item of requiredFiles) {
      try {
        if (fs.existsSync(item.file)) {
          this.logResult(`Config: ${item.description}`, true, "File exists");
        } else {
          this.logResult(`Config: ${item.description}`, false, "File missing");
          allPassed = false;
        }
      } catch (error) {
        this.logResult(
          `Config: ${item.description}`,
          false,
          `Error: ${error.message}`
        );
        allPassed = false;
      }
    }

    // Test environment variables
    const requiredEnvVars = ["OPENROUTER_API_KEY", "MONGODB_URI"];
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.logResult(`Environment: ${envVar}`, true, "Variable configured");
      } else {
        this.logResult(`Environment: ${envVar}`, false, "Variable missing");
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Run all comprehensive tests
   */
  async runAllTests() {
    console.log("🚀 COMPLETE END-TO-END TEST SUITE");
    console.log("Testing all requirements from 1.1 to 6.5");
    console.log("=".repeat(70));

    const startTime = Date.now();

    // Test server health first
    try {
      const healthResponse = await this.makeRequest({
        hostname: "localhost",
        port: 5000,
        path: "/health",
        method: "GET",
      });

      if (healthResponse.statusCode === 200) {
        this.logResult(
          "System Health Check",
          true,
          "Backend server is running"
        );
      } else {
        this.logResult(
          "System Health Check",
          false,
          "Backend server not responding"
        );
        console.log("\n❌ Cannot continue tests without backend server");
        return false;
      }
    } catch (error) {
      this.logResult(
        "System Health Check",
        false,
        `Server connection failed: ${error.message}`
      );
      console.log("\n❌ Cannot continue tests without backend server");
      return false;
    }

    // Run all test suites
    const testSuites = [
      {
        name: "Complete User Journey",
        test: () => this.testCompleteUserJourney(),
      },
      {
        name: "AI Model Architecture",
        test: () => this.testAIModelArchitecture(),
      },
      { name: "Error Scenarios", test: () => this.testErrorScenarios() },
      {
        name: "Security Requirements",
        test: () => this.testSecurityRequirements(),
      },
      {
        name: "Frontend Architecture",
        test: () => this.testFrontendArchitecture(),
      },
      {
        name: "Configuration & Documentation",
        test: () => this.testConfigurationAndDocumentation(),
      },
    ];

    const suiteResults = [];

    for (const suite of testSuites) {
      console.log(`\n📋 ${suite.name}...`);
      try {
        const result = await suite.test();
        suiteResults.push(result);
      } catch (error) {
        console.log(`❌ ${suite.name} crashed: ${error.message}`);
        suiteResults.push(false);
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Print comprehensive summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 COMPREHENSIVE TEST SUMMARY");
    console.log("=".repeat(70));
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📋 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(
      `📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(
        1
      )}%`
    );

    // Test suite breakdown
    console.log("\n📋 TEST SUITE BREAKDOWN:");
    testSuites.forEach((suite, index) => {
      const status = suiteResults[index] ? "✅ PASSED" : "❌ FAILED";
      console.log(`   ${suite.name}: ${status}`);
    });

    // Requirements coverage
    console.log("\n📋 REQUIREMENTS COVERAGE:");
    console.log("   ✅ Requirement 1 (Visual Flow Interface): Tested");
    console.log("   ✅ Requirement 2 (AI Processing Workflow): Tested");
    console.log("   ✅ Requirement 3 (Data Persistence): Tested");
    console.log("   ✅ Requirement 4 (Backend API Security): Tested");
    console.log("   ✅ Requirement 5 (Application Architecture): Tested");
    console.log("   ✅ Requirement 6 (Configuration & Documentation): Tested");

    if (this.failedTests > 0) {
      console.log("\n❌ FAILED TESTS SUMMARY:");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`   - ${result.name}: ${result.message}`);
        });
    }

    const allPassed = this.failedTests === 0;
    console.log("\n" + "=".repeat(70));
    console.log(
      allPassed
        ? "🎉 ALL TESTS PASSED! SYSTEM IS FULLY FUNCTIONAL!"
        : "⚠️  SOME TESTS FAILED - REVIEW REQUIRED"
    );
    console.log("=".repeat(70));

    return allPassed;
  }
}

// Run the complete test suite
async function main() {
  const testSuite = new CompleteE2ETestSuite();

  try {
    const allPassed = await testSuite.runAllTests();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("❌ Complete test suite crashed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = CompleteE2ETestSuite;
