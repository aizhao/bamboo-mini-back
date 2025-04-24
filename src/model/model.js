const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  modelUrl: {
    type: String,
    required: true,
    trim: true,
  },
  previewUrl: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "published", "rejected"],
    default: "pending",
  },
  reviewComment: {
    type: String,
    default: "",
  },
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
  reviewTime: {
    type: Date,
  },
});

module.exports = {
  Model: mongoose.model("Model", modelSchema),
};
