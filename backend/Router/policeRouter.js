const express = require("express");
const route = express.Router();

const policeController = require("../Controller/policeController");

route.post("/", policeController.addpolice); 
// route.post("/login", policeController.login);
// route.get("/findall", policeController.findAll);
// route.get("/findone/:id", policeController.findOne);
// route.put("/update/:id", policeController.update);
// route.delete("/delete/:id", policeController.delete);

module.exports = route;