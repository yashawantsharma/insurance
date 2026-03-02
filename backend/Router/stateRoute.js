const express=require("express")
const route=express.Router()

const stateController=require("../Controller/stateController")

route.post("/",stateController.addstate)

module.exports=route;