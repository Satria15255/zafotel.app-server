import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom } from "../controller/roomController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, admin, upload.single("image"), createRoom);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.put("/:id", protect, admin, upload.single("image"), updateRoom);
router.delete("/:id", protect, admin, deleteRoom);

export default router;
