const mongoose =require("mongoose");

const policeSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
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
            default: "pending",
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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Police", policeSchema);