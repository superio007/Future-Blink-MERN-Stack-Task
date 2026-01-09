const mongoose = require("mongoose");

const promptResponseSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      trim: true,
      maxLength: [10000, "Prompt cannot exceed 10,000 characters"],
      minLength: [1, "Prompt cannot be empty"],
    },
    response: {
      type: String,
      required: [true, "Response is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add timestamps for updatedAt as well
    timestamps: true,
    // Optimize for queries
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
promptResponseSchema.index({ createdAt: -1 });
promptResponseSchema.index({ prompt: "text", response: "text" });

// Add a virtual for formatted creation date
promptResponseSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware for additional validation
promptResponseSchema.pre("save", function () {
  // Trim whitespace and validate prompt is not just whitespace
  if (this.prompt && this.prompt.trim().length === 0) {
    const error = new Error(
      "Prompt cannot be empty or contain only whitespace"
    );
    error.name = "ValidationError";
    throw error;
  }

  // Ensure response is not empty
  if (this.response && this.response.trim().length === 0) {
    const error = new Error(
      "Response cannot be empty or contain only whitespace"
    );
    error.name = "ValidationError";
    throw error;
  }
});

// Static method to find recent responses
promptResponseSchema.statics.findRecent = function (limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("prompt response createdAt");
};

// Instance method to get summary
promptResponseSchema.methods.getSummary = function () {
  return {
    id: this._id,
    prompt:
      this.prompt.length > 100
        ? this.prompt.substring(0, 100) + "..."
        : this.prompt,
    responseLength: this.response.length,
    createdAt: this.createdAt,
  };
};

const PromptResponse = mongoose.model("PromptResponse", promptResponseSchema);

module.exports = PromptResponse;
