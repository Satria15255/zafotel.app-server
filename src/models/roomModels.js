import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  details: {
    size: {
      type: String,
      required: true,
    },
    capacity: {
      type: String,
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
  bookedUnits: {
    type: Number,
    required: true,
    default: 0,
  },
  availableUnits: {
    type: Number,
    default: function () {
      return this.totalUnits - this.bookedUnits;
    },
  },
  status: {
    type: String,
    enum: ["Available", "Booked", "Maintenance"],
    default: "Available",
  },
});

roomSchema.pre("save", function (next) {
  this.availableUnits = this.totalUnits - this.bookedUnits;
  this.status = this.availableUnits > 0 ? "Available" : "Booked";
  next();
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
