const express = require("express");
const router = express.Router();
const paymentController = require("../Controller/paymentController");
const  auth = require("../Middleware/auth");

router.get("/findall", auth, paymentController.getAllPayments);
router.get("/findone/:id", auth, paymentController.getPaymentById);
router.post("/", auth, paymentController.createPayment);
router.put("/update/:id", auth, paymentController.updatePayment);
router.delete("/delete/:id", auth, paymentController.deletePayment);
router.get("/my-payments", auth, paymentController.getMyPayments);

router.get("/policy/:policyId", auth, paymentController.getPolicyPayments);

module.exports = router;