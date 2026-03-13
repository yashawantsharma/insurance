const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Police",
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    // required: true
  },
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    // required: true
  },
  dueDate: {
    type: Date,
    // required: true
  },
  paymentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);