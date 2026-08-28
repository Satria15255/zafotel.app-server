import Room from "../../models/roomModels.js";
import Booking from "../../models/bookingModels.js";

export const getAvailabilityRoom = async ({
	roomId,
	checkInDate,
	checkOutDate,
}) => {
	const room = await Room.findById(roomId);

	if (!room || !room.isActive) {
		throw new Error("Room not available");
	}

	const checkIn = new Date(checkInDate);
	const checkOut = new Date(checkOutDate);

	if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
		throw new Error("Invalid booking date");
	}
	if (checkOut <= checkIn) {
		throw new Error("Invalid check-out date");
	}

	const overlappingBookings = await Booking.find({
		room: roomId,

		bookingStatus: {
			$in: ["Pending", "Confirmed"],
		},

		checkInDate: {
			$lt: checkOut,
		},

		checkOutDate: {
			$gt: checkIn,
		},
	});

	const bookedUnits = overlappingBookings.reduce(
		(total, booking) => total + booking.unitsBooked,
		0,
	);

	const availableUnits = Math.max(room.totalUnits - bookedUnits, 0);

	return {
		totalUnits: room.totalUnits,
		bookedUnits,
		availableUnits,
	};
};
