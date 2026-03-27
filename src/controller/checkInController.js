import Booking from "../models/bookingModels.js";

export const checkInBooking = async (req, res) => {
  try {
    const { bookingCode } = req.body;

    const booking = await Booking.findOne({ bookingCode });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus !== "Confirmed") {
      return res.status(400).json({ message: "Booking not eligible for check-in" });
    }

    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);

    const startCheckInTime = new Date(checkInDate);
    startCheckInTime.setHours(14, 0, 0, 0);

    const endCheckInTime = new Date(checkInDate);
    endCheckInTime.setHours(23, 59, 59, 999);

    if (now < startCheckInTime) {
      return res.status(400).json({ message: "Check-in Time not started yet ( 14.00 )" });
    }

    if (now > endCheckInTime) {
      return res.status(400).json({ message: "Check-in time expired" });
    }

    booking.bookingStatus = "Checked In";
    booking.checkedInAt = now;

    await booking.save();

    res.status(200).json({ message: "Chek-in Successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Check-in Failed",
      error: error.message,
    });
  }
};
