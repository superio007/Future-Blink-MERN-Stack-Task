const http = require("http");

// Test empty prompt
const testEmptyPrompt = () => {
  const postData = JSON.stringify({
    prompt: "",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/ask-ai",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    console.log(`Empty prompt test - Status: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Empty prompt response:", data);
      console.log("---");
      testMissingPrompt();
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

// Test missing prompt
const testMissingPrompt = () => {
  const postData = JSON.stringify({});

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/ask-ai",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    console.log(`Missing prompt test - Status: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Missing prompt response:", data);
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

testEmptyPrompt();
