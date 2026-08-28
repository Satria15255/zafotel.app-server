import Room from "../models/roomModels.js";
import cloudinary from "../config/cloudinary.js";
import { getAvailabilityRoom } from "../services/bookings/availabilityService.js";

export const createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      size,
      capacity,
      bedType,
      amenities,
      facilities,
      price,
      totalUnits,
    } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromise = req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
      });
      imageUrls = await Promise.all(uploadPromise);
    }

    const total = Number(totalUnits) || 0;

    const newRoom = new Room({
      name,
      description,
      price,
      details: {
        size,
        capacity,
        bedType,
        amenities: amenities ? amenities.split(",") : [],
      },
      facilities: facilities ? facilities.split(",") : [],
      totalUnits: total,
      availableUnits: total,
      bookedUnits: 0,
      image: imageUrls,
    });

    await newRoom.save();
    res
      .status(201)
      .json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed creating room", error: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed geting room", erorr: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed getting room", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      size,
      capacity,
      bedType,
      amenities,
      facilities,
      totalUnits,
      bookedUnits,
    } = req.body;
    const updateData = {
      name,
      description,
      price,
      totalUnits: Number(totalUnits),
      bookedUnits: Number(bookedUnits),
      details: {
        size,
        capacity: Number(capacity),
        bedType,
        amenities: amenities ? amenities.split(",") : [],
      },
      facilities: facilities ? facilities.split(",") : [],
    };

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path);
          return result.secure_url;
        }),
      );
      updateData.image = imageUrls;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    updatedRoom.availableUnits =
      updatedRoom.totalUnits - updatedRoom.bookedUnits;
    updatedRoom.status =
      updatedRoom.availableUnits > 0 ? "Available" : "Booked";
    await updatedRoom.save();

    res.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed updating room", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed delete room", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitsToCancel } = req.body;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.bookedUnits < unitsToCancel) {
      return res.status(400).json({ message: "Cancel exceeds booked units" });
    }

    room.bookedUnits -= unitsToCancel;
    room.availableUnits = room.totalUnits - room.bookedUnits;
    room.status = room.availableUnits > 0 ? "Available" : "Booked";

    await room.save();
    res.status(200).json({ message: "Booking cancelled successfully", room });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed cancelled booking", error: error.message });
  }
};

export const checkRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        message: "Check-in and Check-out date are required",
      });
    }

    const availability = await getAvailabilityRoom({
      roomId,
      checkInDate,
      checkOutDate,
    });

    return res.status(200).json({
      message: "Fetch room available success",
      availability,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed get available room",
      error: error.message,
    });
  }
};
