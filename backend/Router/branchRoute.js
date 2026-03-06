const express = require("express");
const route = express.Router();

const branchController = require("../Controller/branchController");

route.post("/", branchController.addbranch);
route.get("/findall", branchController.getAllBranch);
route.get("/findone/:id", branchController.getBranchById);
route.put("/update/:id", branchController.updateBranch);
route.delete("/delete/:id", branchController.deleteBranch);

module.exports = route;