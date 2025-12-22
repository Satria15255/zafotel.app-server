import Information from "../models/informationModels.js";
import cloudinary from "../config/cloudinary.js";

export const createInformation = async (req, res) => {
  try {
    const { title, content } = req.body;

    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const newInformation = new Information({
      title,
      content,
      image: imageUrl,
    });

    await newInformation.save();
    res.status(201).json({ message: "Information Uploaded", information: newInformation });
  } catch (error) {
    res.status(500).json({ message: "Failed upload information", error: error.message });
  }
};

export const getAllInformation = async (req, res) => {
  try {
    const informations = await Information.find();
    res.status(200).json(informations);
  } catch (error) {
    res.status(500).json({ message: "Failed get informations", error: error.message });
  }
};

export const getInformationById = async (req, res) => {
  try {
    const informations = await Information.findById(req.params.id);
    if (!informations) return res.status(404).json({ message: "Informations not found" });
    res.json(informations);
  } catch (error) {
    res.status(500).json({ message: "Failed get information", error: error.message });
  }
};

export const updateInformation = async (req, res) => {
  try {
    const { title, content } = req.body;
    const updateInformation = { title, content };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateInformation.image = result.secure_url;
    }

    const updatedInformation = await Information.findByIdAndUpdate(req.params.id, updateInformation, { new: true });

    if (!updatedInformation) return res.status(401).json({ message: "Information not found" });
    res.status(200).json({ message: "Information updated!", information: updatedInformation });
  } catch (error) {
    res.status(500).json({ message: "Failed updating information!", error: error.message });
  }
};

export const deleteInformation = async (req, res) => {
  try {
    const deletedInformation = await Information.findByIdAndDelete(req.params.id);
    if (!deletedInformation) return res.status(404).json({ message: "Information not found" });

    res.json({ message: "Information deleted successfully", information: deletedInformation });
  } catch (error) {
    res.status(500).json({ message: "Failed deleting information", error: error.message });
  }
};
