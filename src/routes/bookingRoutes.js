import express from "express";
import {
	createBooking,
	getAllBookings,
	getUserBookings,
	getBookingById,
	cancelBooking,
} from "../controller/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/mybookingsroom", protect, getUserBookings);
router.get("/", protect, admin, getAllBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
