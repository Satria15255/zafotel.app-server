import express from "express";
import { createInformation, getAllInformation, getInformationById, updateInformation, deleteInformation } from "../controller/informationController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, admin, upload.single("image"), createInformation);
router.get("/", getAllInformation);
router.get("/:id", getInformationById);
router.put("/:id", protect, admin, upload.single("image"), updateInformation);
router.delete("/:id", protect, admin, deleteInformation);

export default router;
