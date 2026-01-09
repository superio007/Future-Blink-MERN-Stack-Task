const http = require("http");

const postData = JSON.stringify({
  prompt: "Test prompt for save endpoint",
  response: "Test AI response for save endpoint",
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/save",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("Testing POST /api/save endpoint...");
console.log("Request data:", postData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response body:", data);

    try {
      const response = JSON.parse(data);
      if (response.success && response.id) {
        console.log("✅ Save endpoint test PASSED");
        console.log("Document ID:", response.id);
      } else {
        console.log("❌ Save endpoint test FAILED - Invalid response format");
      }
    } catch (e) {
      console.log("❌ Save endpoint test FAILED - Invalid JSON response");
    }
  });
});

req.on("error", (e) => {
  console.error(`❌ Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
