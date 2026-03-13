const Payment = require("../Model/paymentModel");
const Policy = require("../Model/policeModel");
const Customer = require("../Model/userModel");
exports.createPayment = async (req, res) => {
  try {
    const { policyId, installmentNumber,status, amount, dueDate } = req.body;

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const existingPayment = await Payment.findOne({ 
      policyId: policyId, 
      installmentNumber: installmentNumber 
    });
    
    if (existingPayment) {
      return res.status(400).json({ 
        message: `Payment for installment ${installmentNumber} already exists` 
      });
    }

    const payment = new Payment({
      policyId,
      customerId: req.user?._id,
      installmentNumber,
      amount,
      dueDate,
      status,
    });

    await payment.save();
    
    res.status(201).json({ 
      message: "Payment created successfully", 
      payment 
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ 
      message: "Error creating payment", 
      error: error.message 
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("policyId")
      .populate("customerId")
      .sort({ dueDate: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const {id}=req.params
    const payment = await Payment.findById(id)
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment", error: error.message });
  }
};


exports.updatePayment = async (req, res) => {
  try {
    const {id}=req.params
    const {data} = req.body;
    
    const payment = await Payment.findByIdAndUpdate(id,data);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    await payment.save();
    
    res.status(200).json({ message: "Payment updated successfully", payment });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment", error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await payment.save();
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting payment", error: error.message });
  }
};


exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id; 
    
    const payments = await Payment.find({ customerId: userId })
      .populate("policyId", "fullName amount installmentDuration")
      .sort({ createdAt: -1 }); 
    
    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching your payments", 
      error: error.message 
    });
  }
};

exports.getPolicyPayments = async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user._id;
    
    const payments = await Payment.find({ 
      policyId: policyId,
      customerId: userId 
    }).sort({ installmentNumber: 1 });
    
    res.status(200).json({
      success: true,
      payments
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching policy payments", 
      error: error.message 
    });
  }
};