import mongoose from "mongoose";
import Booking from "../models/bookingModels.js";
import Payment from "../models/paymentModels.js";

export const getPaymentById = async (req, res) => {
	try {
		const { paymentId } = req.params;

		const payment = await Payment.findById(paymentId).populate({
			path: "booking",
			select: "bookingCode room checkInDate checkOutDate totalNights unitsBooked totalPrice bookingStatus paymentStatus paymentMethod expiresAt",
			populate: {
				path: "room",
				select: "name price image",
			},
		});

		if (!payment) {
			return res.status(404).json({ message: "Payment not found" });
		}

		// Optional security check
		if (payment.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: "You are not authorized to acces this payment",
			});
		}

		return res
			.status(200)
			.json({ message: "Fetch payment success", payment });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Failed get payment ", error: error.message });
		console.error(error);
	}
};

export const simulatePayment = async (req, res) => {
	const session = await mongoose.startSession();
	try {
		const { paymentId } = req.params;

		session.startTransaction();

		const payment = await Payment.findById(paymentId).session(session);

		if (!payment) {
			return res.status(404).json({ message: "Payment not found" });
		}

		// Authorization
		if (payment.user.toString() !== req.user._id.toString()) {
			await session.abortTransaction();
			return res.status(403).json({
				message: "You are not authorized for this payment",
			});
		}

		// Payment already paid
		if (payment.paymentStatus === "Paid") {
			await session.abortTransaction();
			return res.status(400).json({
				message: "Payment has already been paid",
			});
		}

		// Payment expired
		if (payment.paymentStatus === "Expired") {
			await session.abortTransaction();
			return res.status(400).json({
				message: "Payment has been expired",
			});
		}

		// Get related booking
		const booking = await Booking.findById(payment.booking).session(
			session,
		);

		if (!booking) {
			await session.abortTransaction();
			return res.status(404).json({ message: "Booking not found" });
		}

		// Booking must be still pending
		if (booking.bookingStatus !== "Pending") {
			await session.abortTransaction();
			return res
				.status(400)
				.json({ message: "Booking is not available for payment" });
		}

		// Check booking expiration
		if (booking.expiresAt && new Date() > booking.expiresAt) {
			payment.paymentStatus = "Expired";
			await payment.save({ session });

			booking.bookingStatus = "Expired";
			booking.paymentStatus = "Expired";
			await booking.save({ session });

			await session.commitTransaction();

			return res.status(400).json({ message: "Payment has expired" });
		}

		// SIMULATE PAYMENT
		payment.paymentStatus = "Paid";
		payment.paidAt = new Date();

		booking.paymentStatus = "Paid";
		booking.bookingStatus = "Confirmed";

		await payment.save({ session });
		await booking.save({ session });

		await session.commitTransaction();

		res.status(200).json({ message: "Payment succes", payment, booking });
	} catch (error) {
		res.status(500).json({
			message: "Payment Failed",
			erorr: error.message,
		});
		console.log(error);
	} finally {
		session.endSession();
	}
};
