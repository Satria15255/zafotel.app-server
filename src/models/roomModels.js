import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    details: {
      size: {
        type: String,
        required: true,
      },
      capacity: {
        type: Number,
        required: true,
      },
      bedType: {
        type: String,
        required: true,
      },
      amenities: {
        type: [String],
        required: true,
      },
    },
    facilities: {
      type: [String],
      default: [],
    },
    price: { type: Number, required: true },
    image: {
      type: [String],
      required: true,
    },
    totalUnits: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);


const Room = mongoose.model("Room", roomSchema);

export default Room;
