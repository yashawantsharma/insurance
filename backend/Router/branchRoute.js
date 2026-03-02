const express=require("express")
const route=express.Router()

const branchController=require("../Controller/branchController")

route.post("/",branchController.addbranch)

module.exports=route;