const http = require("http");
require("dotenv").config();

/**
 * Final Validation Test for Task 10.1
 *
 * This test validates the complete end-to-end workflow as required:
 * - Verify full user journey from input to save
 * - Test with supported AI models
 * - Validate all error scenarios work correctly
 *
 * Requirements: All requirements
 */

class FinalValidationTest {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  logResult(testName, passed, message = "") {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName}: PASSED ${message ? `- ${message}` : ""}`);
    } else {
      console.log(`❌ ${testName}: FAILED ${message ? `- ${message}` : ""}`);
    }

    this.testResults.push({ name: testName, passed, message });
  }

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
              data: parsedData,
              rawData: data,
            });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: null, rawData: data });
          }
        });
      });
      req.on("error", reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  async testCompleteWorkflow() {
    console.log("🔄 Testing Complete User Journey (Input → AI → Save)...");

    const testPrompt = "What is the purpose of React Flow in web development?";

    try {
      // Step 1: AI Processing
      const aiResponse = await this.makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/ask-ai",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        JSON.stringify({ prompt: testPrompt })
      );

      if (aiResponse.statusCode === 200 && aiResponse.data.response) {
        this.logResult(
          "Workflow Step 1: AI Processing",
          true,
          `Response: ${aiResponse.data.response.length} chars`
        );

        // Step 2: Data Persistence
        const saveResponse = await this.makeRequest(
          {
            hostname: "localhost",
            port: 5000,
            path: "/api/save",
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
          JSON.stringify({
            prompt: testPrompt,
            response: aiResponse.data.response,
          })
        );

        if (saveResponse.statusCode === 201 && saveResponse.data.success) {
          this.logResult(
            "Workflow Step 2: Data Persistence",
            true,
            `Saved ID: ${saveResponse.data.id}`
          );
          this.logResult(
            "Complete User Journey",
            true,
            "Full workflow successful"
          );
          return true;
        } else {
          this.logResult(
            "Workflow Step 2: Data Persistence",
            false,
            `Save failed: ${saveResponse.statusCode}`
          );
        }
      } else {
        this.logResult(
          "Workflow Step 1: AI Processing",
          false,
          `AI failed: ${aiResponse.statusCode}`
        );
      }
    } catch (error) {
      this.logResult("Complete User Journey", false, `Error: ${error.message}`);
    }
    return false;
  }

  async testAIModels() {
    console.log("\n🤖 Testing AI Model Functionality...");

    const testCases = [
      "What is 10 + 5?",
      "Explain JavaScript in one sentence.",
      "What is the capital of France?",
    ];

    let allPassed = true;
    for (let i = 0; i < testCases.length; i++) {
      try {
        const response = await this.makeRequest(
          {
            hostname: "localhost",
            port: 5000,
            path: "/api/ask-ai",
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
          JSON.stringify({ prompt: testCases[i] })
        );

        if (response.statusCode === 200 && response.data.response) {
          this.logResult(`AI Model Test ${i + 1}`, true, `Response received`);
        } else {
          this.logResult(
            `AI Model Test ${i + 1}`,
            false,
            `Failed: ${response.statusCode}`
          );
          allPassed = false;
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logResult(
          `AI Model Test ${i + 1}`,
          false,
          `Error: ${error.message}`
        );
        allPassed = false;
      }
    }
    return allPassed;
  }

  async testErrorScenarios() {
    console.log("\n⚠️  Testing Error Scenarios...");

    const errorTests = [
      { name: "Empty Prompt", body: { prompt: "" }, expectedStatus: 400 },
      { name: "Missing Prompt", body: {}, expectedStatus: 400 },
      {
        name: "Save Empty Data",
        endpoint: "/api/save",
        body: { prompt: "", response: "test" },
        expectedStatus: 400,
      },
      {
        name: "Invalid Endpoint",
        endpoint: "/api/invalid",
        method: "GET",
        expectedStatus: 404,
      },
    ];

    let allPassed = true;
    for (const test of errorTests) {
      try {
        const response = await this.makeRequest(
          {
            hostname: "localhost",
            port: 5000,
            path: test.endpoint || "/api/ask-ai",
            method: test.method || "POST",
            headers: { "Content-Type": "application/json" },
          },
          test.body ? JSON.stringify(test.body) : null
        );

        if (response.statusCode === test.expectedStatus) {
          this.logResult(
            `Error Test: ${test.name}`,
            true,
            `Correctly returned ${test.expectedStatus}`
          );
        } else {
          this.logResult(
            `Error Test: ${test.name}`,
            false,
            `Expected ${test.expectedStatus}, got ${response.statusCode}`
          );
          allPassed = false;
        }
      } catch (error) {
        this.logResult(
          `Error Test: ${test.name}`,
          false,
          `Error: ${error.message}`
        );
        allPassed = false;
      }
    }
    return allPassed;
  }

  async testSystemRequirements() {
    console.log("\n🔧 Testing System Requirements...");

    // Test server health
    try {
      const health = await this.makeRequest({
        hostname: "localhost",
        port: 5000,
        path: "/health",
        method: "GET",
      });

      if (health.statusCode === 200) {
        this.logResult("System Health", true, "Server responding");
      } else {
        this.logResult("System Health", false, "Server not healthy");
        return false;
      }
    } catch (error) {
      this.logResult(
        "System Health",
        false,
        `Server unreachable: ${error.message}`
      );
      return false;
    }

    // Test environment configuration
    const requiredEnvVars = ["OPENROUTER_API_KEY", "MONGODB_URI"];
    let envPassed = true;

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.logResult(`Environment: ${envVar}`, true, "Configured");
      } else {
        this.logResult(`Environment: ${envVar}`, false, "Missing");
        envPassed = false;
      }
    }

    return envPassed;
  }

  async runAllTests() {
    console.log("🚀 FINAL VALIDATION TEST - Task 10.1");
    console.log("Testing complete end-to-end workflow");
    console.log("=".repeat(50));

    const startTime = Date.now();

    // Run all test categories
    const results = [
      await this.testSystemRequirements(),
      await this.testCompleteWorkflow(),
      await this.testAIModels(),
      await this.testErrorScenarios(),
    ];

    const duration = Date.now() - startTime;
    const allPassed = results.every((r) => r === true);

    console.log("\n" + "=".repeat(50));
    console.log("📊 FINAL TEST SUMMARY");
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📋 Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.totalTests - this.passedTests}`);
    console.log(
      `📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(
        1
      )}%`
    );

    console.log("\n📋 TASK 10.1 REQUIREMENTS VALIDATION:");
    console.log("   ✅ Complete user journey from input to save: TESTED");
    console.log("   ✅ AI model functionality: TESTED");
    console.log("   ✅ Error scenarios validation: TESTED");
    console.log("   ✅ System integration: TESTED");

    if (this.passedTests < this.totalTests) {
      console.log("\n❌ FAILED TESTS:");
      this.testResults
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   - ${r.name}: ${r.message}`);
        });
    }

    console.log("\n" + "=".repeat(50));
    console.log(
      allPassed
        ? "🎉 TASK 10.1 COMPLETED SUCCESSFULLY!"
        : "⚠️  TASK 10.1 HAS ISSUES"
    );
    console.log("=".repeat(50));

    return allPassed;
  }
}

async function main() {
  const validator = new FinalValidationTest();

  try {
    const success = await validator.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("❌ Final validation crashed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FinalValidationTest;
