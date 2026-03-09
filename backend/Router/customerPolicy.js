const express = require("express");
const route = express.Router();

const CustomerPolicyController = require("../Controller/customerPolicy");
const auth=require("../Middleware/auth")

route.post("/",auth,CustomerPolicyController.addcustomer);
route.get("/findall", CustomerPolicyController.getAllcustomer);
route.get("/findone/:id", CustomerPolicyController.onecustomer);
route.put("/update/:id", CustomerPolicyController.updatecustomer);
route.delete("/delete/:id", CustomerPolicyController.deletecustomer);
route.get("/mypolicies", auth, CustomerPolicyController.getMyPolicies);

module.exports = route;