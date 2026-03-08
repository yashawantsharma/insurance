const customerPolice=require("../Model/customerPolicy")


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

    const newPurchase = new customerPolice({
      user: req.user._id,
      policy: policyId,
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