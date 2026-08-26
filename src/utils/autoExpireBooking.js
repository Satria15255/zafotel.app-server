import Booking from "../models/bookingModels.js";
import Payment from "../models/paymentModels.js";

export const startAutoExpireJob = () => {
  setInterval(
    async () => {
      try {
        const now = new Date();

        // =========================
        // EXPIRE TRANSFER BOOKING
        // =========================
        const expiredBookings = await Booking.find({
          paymentMethod: "Bank Transfer",
          paymentStatus: "Unpaid",
          bookingStatus: "Pending",
          expiresAt: { $lt: now },
        });

        for (const booking of expiredBookings) {
          booking.bookingStatus = "Cancelled";
          booking.paymentStatus = "Expired";
          await booking.save();

          // Update related payment
          await Payment.findOneAndUpdate(
            {
              booking: bookingId,
            },
            {
              paymentStatus: "Expired",
            },
          );
        }

        if (expiredBookings.length > 0) {
          console.log(
            `[AUTO-EXPIRE] ${expiredBookings.length} booking(s) expired`,
          );
        }

        // =========================
        // AUTO NO_SHOW
        // =========================
        const confirmedBookings = await Booking.find({
          bookingStatus: "Confirmed",
        });

        for (const booking of confirmedBookings) {
          const checkInEnd = new Date(booking.checkInDate);
          checkInEnd.setHours(23, 59, 59, 999);

          if (now > checkInEnd) {
            booking.bookingStatus = "No Show";
            await booking.save();
          }
        }
      } catch (error) {
        console.error("[AUTO JOB ERROR]", error.message);
      }
    },
    5 * 60 * 1000,
  ); // every 5 minutes
};
