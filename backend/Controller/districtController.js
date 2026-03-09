const district=require("../Model/District")


exports.adddistrict=async(req,res)=>{
    try {
        const  { name } = req.body;
    
        if (!name) {
          return res.status(400).json({
            message: "Country name is required",
          });
        }
         const newname = name.trim().toLowerCase();
        const existingdistrict = await district.findOne({
          name:newname,
        });
    
        
        if (existingdistrict) {
          return res.status(200).json( existingdistrict);
        }
    
    
        const newcountry = new district({
          name:newname,
        });
    
        await newcountry.save();
    
        res.status(201).json({
          message: "Country added successfully",
          data: newcountry,
        });
    
      } catch (error) {
        res.status(500).json({
          message: "Server error",
          error: error.message,
        });
      }
}