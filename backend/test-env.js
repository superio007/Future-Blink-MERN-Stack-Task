require("dotenv").config();

console.log("Environment variables:");
console.log(
  "OPENROUTER_API_KEY:",
  process.env.OPENROUTER_API_KEY
    ? "Set (length: " + process.env.OPENROUTER_API_KEY.length + ")"
    : "Not set"
);
console.log("SITE_URL:", process.env.SITE_URL);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
