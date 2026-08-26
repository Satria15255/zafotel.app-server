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
