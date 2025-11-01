import Room from "../models/roomModels.js";
import cloudinary from "../config/cloudinary.js";

export const createRoom = async (req, res) => {
  try {
    const { name, description, price, capacity, roomType, status } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const newRoom = new Room({
      name,
      description,
      price,
      capacity,
      image: imageUrl,
      roomType,
      status: status || "available",
    });

    await newRoom.save();
    res.status(201).json({ message: "Room created successfully", room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Failed creating room", error: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed geting room", erorr: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed getting room", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { name, description, price, capacity, roomType, status } = req.body;
    const updateData = { name, description, price, capacity, roomType, status };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    res.stastus(500).json({ message: "Failed updating room", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: "Room not found" });

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed delete room", error: error.message });
  }
};
