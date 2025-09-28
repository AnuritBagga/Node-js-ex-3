import express from "express";

const router = express.Router();

// In-memory seat storage
const TOTAL_SEATS = 10;
let seats = Array.from({ length: TOTAL_SEATS }, (_, i) => ({
  id: i + 1,
  status: "available", // available | locked | booked
  lockedBy: null,
  lockExpire: null,
}));

// Helper to check and release expired locks
function releaseExpiredLocks() {
  const now = Date.now();
  seats.forEach((seat) => {
    if (seat.status === "locked" && seat.lockExpire && seat.lockExpire < now) {
      seat.status = "available";
      seat.lockedBy = null;
      seat.lockExpire = null;
    }
  });
}

// Get all seats
router.get("/seats", (req, res) => {
  releaseExpiredLocks();
  res.json(seats);
});

// Lock a seat
router.post("/lock/:id", (req, res) => {
  releaseExpiredLocks();

  const seatId = parseInt(req.params.id);
  const user = req.body.user || "guest";

  const seat = seats.find((s) => s.id === seatId);
  if (!seat) return res.status(404).json({ message: "Seat not found" });

  if (seat.status === "booked") {
    return res.status(400).json({ message: "Seat already booked" });
  }
  if (seat.status === "locked" && seat.lockExpire > Date.now()) {
    return res.status(400).json({ message: "Seat already locked" });
  }

  seat.status = "locked";
  seat.lockedBy = user;
  seat.lockExpire = Date.now() + 60 * 1000; // lock for 1 min

  res.json({ message: `Seat ${seatId} locked for ${user}`, seat });
});

// Confirm booking
router.post("/confirm/:id", (req, res) => {
  releaseExpiredLocks();

  const seatId = parseInt(req.params.id);
  const user = req.body.user || "guest";

  const seat = seats.find((s) => s.id === seatId);
  if (!seat) return res.status(404).json({ message: "Seat not found" });

  if (seat.status === "booked") {
    return res.status(400).json({ message: "Seat already booked" });
  }
  if (seat.status !== "locked" || seat.lockedBy !== user) {
    return res
      .status(400)
      .json({ message: "Seat not locked by you or lock expired" });
  }

  seat.status = "booked";
  seat.lockedBy = user;
  seat.lockExpire = null;

  res.json({ message: `Seat ${seatId} successfully booked by ${user}`, seat });
});

export default router;
