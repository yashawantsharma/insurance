const branch =require("../Model/branchModel")

exports.addbranch=async(req , res)=>{
    try {
        const {branchName,branchCode,address}=req.body
        if(!(branchName,branchCode,address)){
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingbranch=await branch.findOne({branchName})
         if (existingbranch) {
            return res.status(400).json({ message: "Branch already exists" });
        }

        const newbranch=new branch({branchName,branchCode,address})
        await newbranch.save()
        res.status(200).json(newbranch)
    } catch (error) {
        res.status(400).json({message :"branch no add"})
        
    }
}