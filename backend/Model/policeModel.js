const mongoose = require("mongoose");

const policeSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        installmentDuration: {
            type: String,
        },
        installmentAmount: {
            type: Number,
        },
        role: {
            type: String,
            enum: ["police"],
            default: "police",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        // agentId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Agent"
        // },

        policeLocation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "location",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: ["active", "completed", "pending"],
            default: "active",
        },
        endDate: {
            type: Date,
        },
        amount: {
            type: Number,
        },

        totalAmount: {
            type: Number,
        },
        profitAmount: {
            type: Number,
        },
        commissionPercent: {
            type: Number,
            default: 10
        },

        commissionAmount: Number,
          duration: {
            type: Number,
            enum: [5, 10, 15, 20, 25],
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Police", policeSchema);