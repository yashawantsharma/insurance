const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      enum: ["10th", "12th", "graduate", "postgraduate"],
      required: true,
    },

    aadhaarNumber: {
      type: String,
      required: true,
    },

    aadhaarImage: {
      type: String,
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch"
    },

    profileImage: {
      type: String,
      default: "",
    },
    address: {
      type: String,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },



    policie: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Police",
      },
    ],

    isActive: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);