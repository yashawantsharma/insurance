const state =require("../Model/State")


exports.addstate=async(req,res)=>{
    try {
        const  { name } = req.body;
    
        if (!name) {
          return res.status(400).json({
            message: "State name is required",
          });
        }
         const newname = name.trim().toLowerCase();
        const existingstate = await state.findOne({
          name:newname,
        });
    
        
        if (existingstate) {
          return res.status(200).json({
            message: "State already exists",
            data: existingstate,
          });
        }
    
    
        const newstate = new state({
          name:newname,
        });
    
        await newstate.save();
    
        res.status(201).json({
          message: "State added successfully",
          data: newstate,
        });
    
      } catch (error) {
        res.status(500).json({
          message: "Server error",
          error: error.message,
        });
      }
}