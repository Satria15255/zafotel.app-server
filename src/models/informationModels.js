import mongoose from "mongoose";

const informationSchema = new mongoose.Schema(
  {
    title: { type: String },
    content: { type: String },
    image: String,
  },
  { timestamps: true }
);

export default mongoose.model("Information", informationSchema);
