const express = require("express");
const route = express.Router();

const CustomerPolicyController = require("../Controller/customerPolicy");
const auth=require("../Middleware/auth")

route.post("/",auth,CustomerPolicyController.addcustomer);
// route.get("/findall", branchController.getAllBranch);
// route.get("/findone/:id", branchController.getBranchById);
// route.put("/update/:id", branchController.updateBranch);
// route.delete("/delete/:id", branchController.deleteBranch);

module.exports = route;