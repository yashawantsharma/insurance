const express=require("express");
const mongoose=require("mongoose");
const route=express.Router();

const agentController=require("../Controller/agentController");

route.post("/",agentController.addAgent);
route.get("/findall",agentController.getAllAgent);
route.get("/findone/:id",agentController.getAgentById);
route.put("/update/:id",agentController.updateAgent);
route.delete("/delete/:id",agentController.deleteAgent);

module.exports=route;