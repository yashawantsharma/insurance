const Police=require("../Model/policeModel");

exports.addpolice=async(req,res)=>{
    try {
    const { fullName,amount, endDate,totalAmount,profitAmount } = req.body;
    if(!(fullName && amount && endDate && totalAmount && profitAmount)){
        return res.status(400).json({ message: "All fields are required" });
    }
    // console.log(req.body);
    // const existingPolice = await police.findOne({ fullName });
    // if (existingPolice) {
    //     return res.status(400).json({ message: "Police with this name already exists" });
    // }
    // console.log(req.body);
    const newPolice =new Police({
        fullName,
        amount,
        endDate,
        totalAmount,
        profitAmount,
    });

    // console.log(policeData);
    
     await newPolice.save();
    res.status(201).json(newPolice);
}catch (error) {
    res.status(500).json({ message: "Error adding police", error });
}
};
