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

       profileImage: {
      type: String, 
      default: "",
    },
    address: {
      type: String,
      // district: String,
      // city: String,
      // pincode: String,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    // commissionRate: {
    //   type: Number, // percentage
    //   default: 5,
    // },

    // totalCommissionEarned: {
    //   type: Number,
    //   default: 0,
    // },

    policie: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Police",
      },
    ],

    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);