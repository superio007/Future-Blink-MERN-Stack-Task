/**
 * Frontend End-to-End Test
 * Tests the complete frontend workflow including React Flow visualization
 *
 * Note: This test validates the frontend architecture and API integration
 * For full UI testing, a browser automation tool like Playwright would be needed
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.4, 3.1, 5.1, 5.4
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

class FrontendE2ETest {
  constructor() {
    this.backendUrl = "http://localhost:5000";
    this.testResults = [];
  }

  /**
   * Log test result
   */
  logResult(testName, passed, message = "") {
    if (passed) {
      console.log(`✅ ${testName}: PASSED ${message ? `- ${message}` : ""}`);
    } else {
      console.log(`❌ ${testName}: FAILED ${message ? `- ${message}` : ""}`);
    }

    this.testResults.push({
      name: testName,
      passed,
      message,
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
   * Test frontend file structure and components
   */
  async testFrontendStructure() {
    console.log("📁 Testing Frontend Structure...");

    const requiredFiles = [
      "src/App.jsx",
      "src/main.jsx",
      "src/components/InputNode.jsx",
      "src/components/ResultNode.jsx",
      "src/components/ErrorBoundary.jsx",
      "src/components/ErrorDisplay.jsx",
      "src/components/LoadingSpinner.jsx",
      "src/components/SuccessNotification.jsx",
      "src/utils/validation.js",
      "package.json",
      "vite.config.js",
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
      try {
        if (fs.existsSync(file)) {
          this.logResult(`File Structure: ${file}`, true, "File exists");
        } else {
          this.logResult(`File Structure: ${file}`, false, "File missing");
          allFilesExist = false;
        }
      } catch (error) {
        this.logResult(
          `File Structure: ${file}`,
          false,
          `Error checking file: ${error.message}`
        );
        allFilesExist = false;
      }
    }

    return allFilesExist;
  }

  /**
   * Test React Flow configuration and dependencies
   */
  async testReactFlowConfiguration() {
    console.log("\n⚛️  Testing React Flow Configuration...");

    try {
      // Check package.json for React Flow dependency
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      if (packageJson.dependencies["@xyflow/react"]) {
        this.logResult(
          "React Flow Dependency",
          true,
          `Version: ${packageJson.dependencies["@xyflow/react"]}`
        );
      } else {
        this.logResult(
          "React Flow Dependency",
          false,
          "React Flow not found in dependencies"
        );
        return false;
      }

      // Check App.jsx for React Flow usage
      const appContent = fs.readFileSync("src/App.jsx", "utf8");

      const reactFlowChecks = [
        {
          name: "ReactFlow Import",
          pattern: /import.*ReactFlow.*from.*@xyflow\/react/,
        },
        { name: "Custom Node Types", pattern: /nodeTypes.*=.*{/ },
        { name: "Initial Nodes", pattern: /initialNodes.*=.*\[/ },
        { name: "Initial Edges", pattern: /initialEdges.*=.*\[/ },
        { name: "Input Node Type", pattern: /inputNode/ },
        { name: "Result Node Type", pattern: /resultNode/ },
      ];

      let allChecksPass = true;
      for (const check of reactFlowChecks) {
        if (check.pattern.test(appContent)) {
          this.logResult(`React Flow: ${check.name}`, true, "Found in App.jsx");
        } else {
          this.logResult(
            `React Flow: ${check.name}`,
            false,
            "Not found in App.jsx"
          );
          allChecksPass = false;
        }
      }

      return allChecksPass;
    } catch (error) {
      this.logResult(
        "React Flow Configuration",
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test custom node components
   */
  async testCustomNodeComponents() {
    console.log("\n🔧 Testing Custom Node Components...");

    try {
      // Test InputNode component
      const inputNodeContent = fs.readFileSync(
        "src/components/InputNode.jsx",
        "utf8"
      );

      const inputNodeChecks = [
        { name: "Textarea Element", pattern: /<textarea/ },
        { name: "Handle Component", pattern: /Handle/ },
        { name: "OnChange Handler", pattern: /onChange/ },
        { name: "Value Prop", pattern: /value.*=/ },
      ];

      let inputNodePassed = true;
      for (const check of inputNodeChecks) {
        if (check.pattern.test(inputNodeContent)) {
          this.logResult(
            `InputNode: ${check.name}`,
            true,
            "Implementation found"
          );
        } else {
          this.logResult(
            `InputNode: ${check.name}`,
            false,
            "Implementation missing"
          );
          inputNodePassed = false;
        }
      }

      // Test ResultNode component
      const resultNodeContent = fs.readFileSync(
        "src/components/ResultNode.jsx",
        "utf8"
      );

      const resultNodeChecks = [
        { name: "Content Display", pattern: /content/ },
        { name: "Loading State", pattern: /loading/ },
        { name: "Handle Component", pattern: /Handle/ },
      ];

      let resultNodePassed = true;
      for (const check of resultNodeChecks) {
        if (check.pattern.test(resultNodeContent)) {
          this.logResult(
            `ResultNode: ${check.name}`,
            true,
            "Implementation found"
          );
        } else {
          this.logResult(
            `ResultNode: ${check.name}`,
            false,
            "Implementation missing"
          );
          resultNodePassed = false;
        }
      }

      return inputNodePassed && resultNodePassed;
    } catch (error) {
      this.logResult(
        "Custom Node Components",
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test frontend-backend integration
   */
  async testFrontendBackendIntegration() {
    console.log("\n🔗 Testing Frontend-Backend Integration...");

    try {
      const appContent = fs.readFileSync("src/App.jsx", "utf8");

      const integrationChecks = [
        { name: "API Endpoint Configuration", pattern: /localhost:5000\/api/ },
        { name: "Run Flow Handler", pattern: /handleRunFlow/ },
        { name: "Save Handler", pattern: /handleSave/ },
        { name: "Fetch API Usage", pattern: /fetch\(/ },
        { name: "Error Handling", pattern: /catch.*error/ },
        { name: "Loading States", pattern: /setIsLoading/ },
      ];

      let allIntegrationChecks = true;
      for (const check of integrationChecks) {
        if (check.pattern.test(appContent)) {
          this.logResult(
            `Integration: ${check.name}`,
            true,
            "Implementation found"
          );
        } else {
          this.logResult(
            `Integration: ${check.name}`,
            false,
            "Implementation missing"
          );
          allIntegrationChecks = false;
        }
      }

      return allIntegrationChecks;
    } catch (error) {
      this.logResult(
        "Frontend-Backend Integration",
        false,
        `Error: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Test validation utilities
   */
  async testValidationUtilities() {
    console.log("\n✅ Testing Validation Utilities...");

    try {
      const validationContent = fs.readFileSync(
        "src/utils/validation.js",
        "utf8"
      );

      const validationChecks = [
        { name: "Prompt Validation", pattern: /validatePrompt/ },
        {
          name: "Prompt-Response Validation",
          pattern: /validatePromptResponsePair/,
        },
        { name: "Input Sanitization", pattern: /sanitizeInput/ },
        { name: "Export Functions", pattern: /export.*{/ },
      ];

      let allValidationChecks = true;
      for (const check of validationChecks) {
        if (check.pattern.test(validationContent)) {
          this.logResult(`Validation: ${check.name}`, true, "Function found");
        } else {
          this.logResult(
            `Validation: ${check.name}`,
            false,
            "Function missing"
          );
          allValidationChecks = false;
        }
      }

      return allValidationChecks;
    } catch (error) {
      this.logResult("Validation Utilities", false, `Error: ${error.message}`);
      return false;
    }
  }

  /**
   * Test error handling components
   */
  async testErrorHandlingComponents() {
    console.log("\n🚨 Testing Error Handling Components...");

    const errorComponents = [
      "src/components/ErrorBoundary.jsx",
      "src/components/ErrorDisplay.jsx",
      "src/components/LoadingSpinner.jsx",
      "src/components/SuccessNotification.jsx",
    ];

    let allComponentsValid = true;

    for (const component of errorComponents) {
      try {
        const content = fs.readFileSync(component, "utf8");
        const componentName = path.basename(component, ".jsx");

        // Basic checks for React component structure
        const hasExport = /export.*default/.test(content);
        const hasReactImport =
          /import.*React/.test(content) ||
          /import.*{.*}.*from.*react/.test(content);
        const hasJSX =
          /<[A-Z]/.test(content) ||
          /<div/.test(content) ||
          /<span/.test(content);

        if (hasExport && (hasReactImport || hasJSX)) {
          this.logResult(
            `Error Component: ${componentName}`,
            true,
            "Valid React component"
          );
        } else {
          this.logResult(
            `Error Component: ${componentName}`,
            false,
            "Invalid React component structure"
          );
          allComponentsValid = false;
        }
      } catch (error) {
        this.logResult(
          `Error Component: ${path.basename(component, ".jsx")}`,
          false,
          `Error reading file: ${error.message}`
        );
        allComponentsValid = false;
      }
    }

    return allComponentsValid;
  }

  /**
   * Test backend connectivity from frontend perspective
   */
  async testBackendConnectivity() {
    console.log("\n🌐 Testing Backend Connectivity...");

    // Simulate the same requests that the frontend would make
    const testCases = [
      {
        name: "Health Check",
        path: "/health",
        method: "GET",
        expectedStatus: 200,
      },
      {
        name: "AI API Endpoint",
        path: "/api/ask-ai",
        method: "POST",
        body: { prompt: "Frontend connectivity test" },
        expectedStatus: 200,
      },
      {
        name: "Save API Endpoint",
        path: "/api/save",
        method: "POST",
        body: { prompt: "Test prompt", response: "Test response" },
        expectedStatus: 201,
      },
    ];

    let allConnectivityTests = true;

    for (const testCase of testCases) {
      try {
        const options = {
          hostname: "localhost",
          port: 5000,
          path: testCase.path,
          method: testCase.method,
          headers: {
            "Content-Type": "application/json",
          },
        };

        const postData = testCase.body ? JSON.stringify(testCase.body) : null;
        const response = await this.makeRequest(options, postData);

        if (response.statusCode === testCase.expectedStatus) {
          this.logResult(
            `Backend Connectivity: ${testCase.name}`,
            true,
            `Status: ${response.statusCode}`
          );
        } else {
          this.logResult(
            `Backend Connectivity: ${testCase.name}`,
            false,
            `Expected ${testCase.expectedStatus}, got ${response.statusCode}`
          );
          allConnectivityTests = false;
        }
      } catch (error) {
        this.logResult(
          `Backend Connectivity: ${testCase.name}`,
          false,
          `Connection error: ${error.message}`
        );
        allConnectivityTests = false;
      }
    }

    return allConnectivityTests;
  }

  /**
   * Run all frontend tests
   */
  async runAllTests() {
    console.log("🚀 Starting Frontend End-to-End Test Suite");
    console.log("=".repeat(60));

    const testResults = [];

    // Test 1: Frontend Structure
    testResults.push(await this.testFrontendStructure());

    // Test 2: React Flow Configuration
    testResults.push(await this.testReactFlowConfiguration());

    // Test 3: Custom Node Components
    testResults.push(await this.testCustomNodeComponents());

    // Test 4: Frontend-Backend Integration
    testResults.push(await this.testFrontendBackendIntegration());

    // Test 5: Validation Utilities
    testResults.push(await this.testValidationUtilities());

    // Test 6: Error Handling Components
    testResults.push(await this.testErrorHandlingComponents());

    // Test 7: Backend Connectivity
    testResults.push(await this.testBackendConnectivity());

    const passedTests = this.testResults.filter((r) => r.passed).length;
    const totalTests = this.testResults.length;
    const allPassed = testResults.every((result) => result === true);

    console.log("\n" + "=".repeat(60));
    console.log("📊 FRONTEND TEST SUMMARY");
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    console.log(
      `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    if (!allPassed) {
      console.log("\n❌ FAILED TESTS:");
      this.testResults
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`   - ${result.name}: ${result.message}`);
        });
    }

    console.log(
      "\n" +
        (allPassed
          ? "🎉 ALL FRONTEND TESTS PASSED!"
          : "⚠️  SOME FRONTEND TESTS FAILED")
    );

    return allPassed;
  }
}

// Run the test suite
async function main() {
  const testSuite = new FrontendE2ETest();

  try {
    const allPassed = await testSuite.runAllTests();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error("❌ Frontend test suite crashed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = FrontendE2ETest;
