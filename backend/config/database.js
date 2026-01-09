const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // Connection options for better reliability
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      return conn;
    } catch (error) {
      console.error(
        `Database connection attempt ${i + 1} failed:`,
        error.message
      );

      if (i === retries - 1) {
        console.error(
          "All database connection attempts failed. Continuing without database..."
        );
        throw new Error("Database connection failed");
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error during database disconnection:", error);
    process.exit(1);
  }
});

module.exports = connectDB;
