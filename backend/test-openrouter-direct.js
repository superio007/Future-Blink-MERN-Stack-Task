const https = require("https");
require("dotenv").config();

const testOpenRouterDirect = () => {
  const postData = JSON.stringify({
    model: "google/gemini-flash-1.5:free",
    messages: [
      {
        role: "user",
        content: "Hello, this is a test",
      },
    ],
  });

  const options = {
    hostname: "openrouter.ai",
    port: 443,
    path: "/api/v1/chat/completions",
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
      "X-Title": "AI Flow Visualizer",
    },
  };

  console.log("Making request to OpenRouter with:");
  console.log(
    "API Key length:",
    process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY.length
      : "Not set"
  );
  console.log("Headers:", options.headers);
  console.log("Body:", postData);
  console.log("---");

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Response body:", data);

      try {
        const parsed = JSON.parse(data);
        console.log("Parsed response:", JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("Could not parse as JSON");
      }
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

testOpenRouterDirect();
