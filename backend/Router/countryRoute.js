const express=require("express")
const route=express.Router()

const countryController=require("../Controller/countryController")

route.post("/",countryController.addcountries)

module.exports=route;