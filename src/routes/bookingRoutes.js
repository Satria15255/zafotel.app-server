import express from "express";
import { createBooking, getAllBookings, getUserBookings, getBookingById, confirmPayment, approvePayment, cancelBooking } from "../controller/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.post("/:id/confirm-payment", upload.single("paymentProof"), protect, confirmPayment);
router.get("/mybookingsroom", protect, getUserBookings);
router.get("/", protect, admin, getAllBookings);
router.get("/:id", protect, getBookingById);
router.patch("/admin/:id/approve", approvePayment, admin);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
