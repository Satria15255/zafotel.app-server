import express from "express";
import { checkInBooking } from "../controller/checkInController.js";
import { admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", checkInBooking, admin);

export default router;
