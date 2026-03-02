const mongoose = require("mongoose");
const express = require("express");
const route = express.Router();

const userController = require("../Controller/userController");
const auth = require("../Middleware/auth");

route.post("/", userController.register);
route.get("/findall",userController.findAll);
route.get("/findone/:id",userController.findOne);
route.put("/update/:id",userController.update);
route.delete("/delete/:id",userController.delete);
route.post("/login",userController.login);
route.post("/forgot",userController.forgot);
route.post("/reset",userController.reset);
route.post("/updatetheme",auth,userController.updatetheme)
route.get("/theme",auth,userController.findTheme);
route.post("/otp",userController.sendotp)

module.exports=route
