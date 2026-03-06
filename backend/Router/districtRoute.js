const express=require("express")
const route=express.Router()

const districtController=require("../Controller/districtController")

route.post("/",districtController.adddistrict)

module.exports=route;