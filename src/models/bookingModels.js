import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bookingCode: {
      type: String,
      unique: true,
      required: true,
    },
    userName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalNights: {
      type: Number,
      required: true,
    },
    unitsBooked: {
      type: Number,
      required: true,
    },
    totalPrice: { type: Number, required: true },
    bookingStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Checked In",
        "Completed",
        "Cancelled",
        "No Show",
        "Expired",
      ],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash"],
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "In review", "Rejected", "Refunded", "Expired"],
      default: "Unpaid",
    },
    expiresAt: {
      type: Date,
    },
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      default: 0,
    },
    actualCheckInTime: {
      type: Date,
    },
    actualCheckOutTime: {
      type: Date,
    },
    paymentProof: {
      type: String, // url screenshot transfer
    },
    checkedInAt: Date,
    checkedOutAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
