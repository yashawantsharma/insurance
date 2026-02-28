const Police=require("../Model/policeModel");

exports.addpolice=async(req,res)=>{
    try {
    const { fullName,amount,installmentDuration,installmentAmount, endDate,totalAmount,profitAmount } = req.body;
    if(!(fullName && amount && installmentDuration && installmentAmount && endDate && totalAmount && profitAmount)){
        return res.status(400).json({ message: "All fields are required" });
    }

    const newPolice =new Police({
        fullName,
        amount,
        installmentDuration,
        installmentAmount,
        endDate,
        totalAmount,
        profitAmount,
    });
    
     await newPolice.save();
    res.status(201).json(newPolice);
}catch (error) {
    res.status(500).json({ message: "Error adding police", error });
}
};


exports.getAllPolice=async(req,res)=>{
    try {
        const policeList=await Police.find();
        res.status(200).json(policeList);
    } catch (error) {
        res.status(500).json({ message: "Error fetching police list", error });
    }   
};

exports.getPoliceById=async(req,res)=>{
    try {
        const { id } = req.params;
        const police=await Police.findById(id);
        if(!police){
            return res.status(404).json({ message: "Police not found" });
        }
        res.status(200).json(police);
    } catch (error) {
        res.status(500).json({ message: "Error fetching police", error });
    }
};

exports.updatePolice=async(req,res)=>{  
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedPolice = await Police.findByIdAndUpdate(id, data, { new: true });
        if (!updatedPolice) {
            return res.status(404).json({ message: "Police not found" });
        }
        res.status(200).json(updatedPolice);
    } catch (error) {
        res.status(500).json({ message: "Error updating police", error });
    }
};

exports.deletePolice=async(req,res)=>{

    try {
        const { id } = req.params;
        const deletedPolice = await Police.findByIdAndDelete(id);
        if (!deletedPolice) {
            return res.status(404).json({ message: "Police not found" });
        }

        res.status(200).json({ message: "Police deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting police", error });
    }

};