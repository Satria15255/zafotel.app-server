import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  capacity: Number,
  image: String,
  roomType: {
    type: String,
    enum: ["Single", "Double", "Suite", "Deluxe", "luxury"],
    default: "Single",
  },
  status: {
    type: String,
    enum: ["Available", "Booked", "Maintenance"],
    default: "Available",
  },
});

export default mongoose.model("Room", roomSchema);
