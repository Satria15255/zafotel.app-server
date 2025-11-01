import multer from "multer";
import pkg from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

const { CloudinaryStorage } = pkg;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Zafotel",
    allowedFormats: ["jpg", "png", "jpeg", "gif"],
  },
});

const upload = multer({ storage });

export default upload;
