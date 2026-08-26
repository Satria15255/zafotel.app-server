import express from "express";
import {
	getPaymentById,
	simulatePayment,
} from "../controller/paymentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:paymentId", protect, getPaymentById);
router.post("/:paymentId/pay", protect, simulatePayment);

export default router;
