import Booking from "../models/bookingModels.js";
import Room from "../models/roomModels.js";

export const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    if (!room) return res.status(401).json({ message: "Room not found" });
    if (room.status !== "available") return res.status(400).json({ message: "Room not available" });

    const dayCount = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = room.price * dayCount;

    const booking = new Booking({
      user: userId,
      room: roomId,
      checkIn,
      checkOut,
      totalPrice,
    });

    await booking.save();

    room.status = "Booked";
    await room.save();

    res.status(201).json({ message: "Booking created", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed booking the room", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").populate("room", "name price");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed get booking", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate("room", "name price");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed get bookings", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "Cancelled";
    await booking.save();

    const room = await Room.findById(booking.room);
    if (room) {
      room.status = "Available";
      await room.save();
    }

    res.status(201).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(404).json({ message: "Failed to cancel booking", error: error.message });
  }
};
