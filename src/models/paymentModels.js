import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		booking: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
			required: true,
			unique: true,
		},

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		paymentMethod: {
			type: String,
			enum: ["Cash", "Bank Transfer"],
			required: true,
		},

		amount: {
			type: Number,
			required: true,
			min: 0,
		},

		paymentStatus: {
			type: String,
			enum: ["Unpaid", "Paid", "Failed", "Expired"],
			default: "Unpaid",
		},

		bankName: {
			type: String,
			default: null,
		},

		accountName: {
			type: String,
			default: null,
		},

		accountNumber: {
			type: String,
			default: null,
		},

		paidAt: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
