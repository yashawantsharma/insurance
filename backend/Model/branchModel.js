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
    },

    // state: {
    //    type: mongoose.Schema.Types.ObjectId,
    //   ref: "State",
    // },

    address: {
      type: String,
    },

    pincode: {
      type: String,
    },

    phone: {
      type: String,
    },

    email: {
      type: String,
    },

    branchManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },

    totalAgents: {
      type: Number,
      default: 0,
    },

    totalCustomers: {
      type: Number,
      default: 0,
    },

    totalPolicies: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);