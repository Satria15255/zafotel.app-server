import Booking from "../models/bookingModels.js";
import Room from "../models/roomModels.js";

export const createBooking = async (req, res) => {
  try {
    const { user, userName, phoneNumber, roomId, checkInDate, checkOutDate, unitsBooked } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(401).json({ message: "Room not found" });

    if (room.availableUnits < unitsBooked) {
      return res.status(400).json({ message: "Not enough available units" });
    }

    const chekIn = new Date(checkInDate);
    const chekOut = new Date(checkOutDate);
    const totalNights = Math.ceil((chekOut - chekIn) / (1000 * 60 * 60 * 24));

    const totalPrice = room.price * totalNights * unitsBooked;

    const newBooking = new Booking({
      user: req.user._id,
      room: roomId,
      userName,
      phoneNumber,
      checkInDate,
      checkOutDate,
      totalNights,
      unitsBooked,
      totalPrice,
      status: "Confirmed",
    });

    await newBooking.save();

    room.bookedUnits += unitsBooked;
    room.availableUnits = room.totalUnits - room.bookedUnits;
    room.status = room.availableUnits > 0 ? "Available" : "Booked";
    await room.save();

    res.status(201).json({ message: "Booking created", booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed booking the room", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user", "name email").populate("room", "name price image");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed get booking", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId }).populate("room", "name price  image");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed get bookings", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "Cancelled") return res.status(400).json({ message: "Already cancelled" });

    const room = booking.room;

    const newBookedUnits = room.bookedUnits - booking.unitsBooked;
    room.bookedUnits = Math.max(newBookedUnits, 0);

    room.availableUnits = Math.min(room.totalUnits - room.bookedUnits, room.totalUnits);

    if (room.availableUnits === 0) {
      room.status = "Fully Booked";
    } else if (room.availableUnits === room.totalUnits) {
      room.status = "Available";
    } else {
      room.status = "Partially Booked";
    }

    await room.save();

    booking.status = "Cancelled";
    await booking.save();

    res.status(201).json({
      message: "Booking cancelled",
      booking,
      updatedRoom: {
        name: room.name,
        totalUnits: room.totalUnits,
        bookedUnits: room.bookedUnits,
        availableUnits: room.availableUnits,
        status: room.status,
      },
    });
  } catch (error) {
    res.status(404).json({ message: "Failed to cancel booking", error: error.message });
  }
};
