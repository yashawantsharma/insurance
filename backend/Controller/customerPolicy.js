const customerPolice=require("../Model/customerPolicy")
const User = require("../Model/userModel")


exports.addcustomer = async (req, res) => {
  try {

   const {
      policyId,
      premiumAmount,
      purchaseDate,
      startDate,
      nextInstallmentDate,
      paymentMode
    } = req.body;
   const userId=req.user._id
     const userData = await User.findById(userId)
     if(!userData){
      return res.status(404).json({
        message:"User not found"
      })
    }
    const agentId = userData.agentId

    const newPurchase = new customerPolice({
      user: userId,
      policy: policyId,
      agent:agentId,
      premiumAmount,
      purchaseDate,
      startDate,
      nextInstallmentDate,
      paymentMode
    });

    await newPurchase.save();

    res.status(201).json( newPurchase
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllcustomer = async (req, res) => {
    try {
        const customerPolicies = await customerPolice.find()
            .populate("user") 
            .populate("policy");    
        res.status(200).json({
            success: true,
            count: customerPolicies.length,
            data: customerPolicies
        });
        
    } catch (error) {
        console.error("Error fetching customer policies:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};
exports.deletecustomer = async (req, res) => {
    try {
        const {id} = req.params;
        const customerPolice = await customerPolice.findByIdAndDelete(id);
        if (!customerPolice) {
            return res.status(404).json({ message: "customer not found" });
        }
        res.status(200).json({ message: "customer deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



exports.onecustomer = async (req, res) => {
    try {
        const customerPolice = req.params.id;
        const foundAgent = await customerPolice.findById(customerPolice);
        if (!foundAgent) {
            return res.status(404).json({ message: "customer not found" });
        }
        res.status(200).json(foundAgent);
    } catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.updatecustomer = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;
        const updatedAgent = await customerPolice.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedAgent) {
            return res.status(404).json({ message: "customer not found" });
        }
        res.status(200).json({ message: "coustomer updated successfully", agent: updatedAgent });
    } catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



exports.getMyPolicies = async (req, res) => {
  try {

    const userId = req.user.id; 

    const data = await customerPolice
      .find({ user: userId })
      .populate("policy").populate("agent")
      .populate("user");

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};