import express from "express";
import { createBooking, getAllBookings, getUserBookings, cancelBooking } from "../controller/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/mybookingsroom", protect, getUserBookings);
router.get("/", protect, admin, getAllBookings);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
