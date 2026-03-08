const mongoose = require("mongoose");

const customerPolicySchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    // required: true
  },

  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Police",
    // required: true
  },

  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent"
  },

  purchaseDate: {
    type: Date,
    default: Date.now
  },

  startDate: {
    type: Date
  },

  // NextDueDate: {
  //   type: Date
  // },

  premiumAmount: {
    type: Number,
    required: true
  },

  totalAmount: {
    type: Number
  },

  profitAmount: {
    type: Number
  },

  paymentMode: {
    type: String,
    enum: ["cash","upi","card","bank"]
  },

  status: {
    type: String,
    enum: ["active","completed","cancelled"],
    default: "active"
  },

  installmentsPaid: {
    type: Number,
    default: 0
  },

  nextInstallmentDate: {
    type: Date
  }

}, { timestamps:true });

module.exports = mongoose.model("CustomerPolicy", customerPolicySchema)