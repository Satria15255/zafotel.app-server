import express from "express";
import { getPaymentById } from "../controller/paymentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:paymentId", protect, getPaymentById);

export default router;
