const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    branchCode: {
      type: String,
      required: true,
      unique: true,
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      // required: true,
    },
    totalAgents: {
      type: Number,
      default: 0,
    },

    address: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("branch", branchSchema);