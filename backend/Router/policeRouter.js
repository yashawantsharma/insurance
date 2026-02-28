const express = require("express");
const route = express.Router();

const policeController = require("../Controller/policeController");

route.post("/", policeController.addpolice); 
// route.post("/login", policeController.login);
route.get("/findall", policeController.getAllPolice);
route.get("/findone/:id", policeController.getPoliceById);
route.put("/update/:id", policeController.updatePolice);
route.delete("/delete/:id", policeController.deletePolice);

module.exports = route;