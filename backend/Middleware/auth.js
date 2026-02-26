const user=require("../Model/userModel")
const jwt=require('jsonwebtoken')
// const secretkey="sdngfgdsadfdgfsg"


module.exports=async(req,res,next)=>{
    try {
        const autoheader=req.headers.authorization
        if(!autoheader){
            return res.status(400).json({massage:"token not found"})
        }
        const token=autoheader.split(" ")[1]
        if(!token){
            return res.status(400).json({message:'invalid token'})
        }

        const decode=jwt.verify(token,process.env.JWT_SECRET)
         if(!decode){
            return res.status(400).json({message:'invalid user'})
        }


        const existinguser=await user.findById(decode.id)
        
        if(!existinguser){
            return res.status(400).json({message:'user not found'})
        } 
        req.user=existinguser
        next()
    } catch (error) {
         if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" })
        }
        res.status(500).json({message:"internal server error",error})
    }
}