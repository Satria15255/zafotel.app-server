import Booking from "../models/bookingModels.js";
import Room from "../models/roomModels.js";
import Payment from "../models/paymentModels.js";
import { generateBookingCode } from "../utils/generateBookingCode.js";
import { getAvailabilityRoom } from "../services/bookings/availabilityService.js";

export const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      unitsBooked,
      paymentMethod,
      userName,
      phoneNumber,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ message: "Room Not Available" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    // Booking window validation
    const startOfCheckInDay = new Date(checkIn);
    startOfCheckInDay.setHours(0, 1, 0, 0);

    const minBookingTime = new Date(
      startOfCheckInDay.getTime() - 12 * 60 * 60 * 1000,
    );
    const maxBookingTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (now > minBookingTime) {
      return res.status(400).json({ message: "Booking to late (H-10 rules)" });
    }

    if (checkIn > maxBookingTime) {
      return res.status(400).json({ message: "Booking exceds H-30 limit" });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: "Invalid check-out date" });
    }

    // Overlapping check
    const availability = await getAvailabilityRoom({
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
    });

    if (unitsBooked > availability.availableUnits) {
      return res
        .status(400)
        .json({ message: "Room not available for selected dates" });
    }

    // ❗ Generate unique booking code
    let bookingCode;
    let isUnique = false;

    while (!isUnique) {
      bookingCode = generateBookingCode();
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
    }

    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const totalPrice = room.price * totalNights * unitsBooked;

    let bookingStatus = "Pending";
    let paymentStatus = "Unpaid";
    let expiresAt = null;

    if (paymentMethod === "Bank Transfer") {
      bookingStatus = "Pending";
      paymentStatus = "Unpaid";
      expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    }

    if (paymentMethod === "Cash") {
      bookingStatus = "Confirmed";
      paymentStatus = "Unpaid";
    }

    const newBooking = new Booking({
      user: req.user._id,
      room: roomId,
      bookingCode,
      userName,
      phoneNumber,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights,
      unitsBooked,
      totalPrice,
      bookingStatus,
      paymentMethod,
      paymentStatus,
      expiresAt,
    });

    await newBooking.save();

    const newPayment = new Payment({
      booking: newBooking._id,
      user: req.user._id,
      paymentMethod,
      amount: totalPrice,
      paymentStatus: "Unpaid",
    });

    await newPayment.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
      payment: newPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("room", "name price image");
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed get booking", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate(
      "room",
      "name price  image",
    );
    res.json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed get bookings", error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room", "name price image")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed get bookings", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    if (booking.bookingStatus === "Checked In") {
      return res.status(400).json({ message: "Cannot cancel after check in" });
    }

    const now = new Date();
    const checkin = new Date(booking.checkInDate);

    const startOfCheckInDay = new Date(checkin);
    startOfCheckInDay.setHours(0, 1, 0, 0);

    const refundDeadline = new Date(
      startOfCheckInDay.getTime() - 10 * 60 * 60 * 1000,
    );

    let refundPercentage = 1; //default 100%

    if (now > refundDeadline) {
      refundPercentage = 0.3; //30%
    }

    const refundAmount = booking.totalPrice * refundPercentage;

    booking.bookingStatus = "Cancelled";
    booking.paymentStatus = "Refunded";
    booking.cancelledAt = now;
    booking.refundAmount = refundAmount;

    if (booking.bookingStatus === "Paid") {
      refundPercentage = 0;
    }

    await booking.save();

    res.json({
      message: "Booking cancelled succesfully",
      refundPercentage: refundPercentage * 100,
      refundAmount,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Failed to cancel booking", error: error.message });
  }
};

// Payment Controller
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentMethod !== "Bank Transfer") {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (booking.paymentStatus !== "Unpaid") {
      return res.status(400).json({ message: "Payment Submitted" });
    }

    if (booking.expiresAt && new Date() > booking.expiresAt) {
      booking.bookingStatus = "Cancelled";
      await booking.save();
      return res.status(400).json({ message: "Booking Expired" });
    }

    booking.paymentProof = req.file.path;
    booking.paymentStatus = "In review";

    await booking.save();

    res.json({ message: "Booking Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Payment Failed",
      error: error.message,
    });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus !== "Waiting Confirmation") {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    booking.paymentStatus = "Paid";
    booking.bookingStatus = "Confirmed";
    booking.confirmedAt = new Date();

    await booking.save();
    res.json({ message: "Payment Approved!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed Aprroved Payment", error: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = "Rejected";

    await booking.save();

    res.status(200).json({ message: "Payment Rejected" });
  } catch (error) {
    res.status(500).json({
      message: "Rejected Failed",
      error: error.message,
    });
  }
};
