const express = require('express');
const app = express();
app.use(express.json());

const SEAT_LOCK_DURATION = 60 * 1000; // 1 minute in milliseconds

// In-memory seat "database"
let seats = {
  "1": { status: "available" },
  "2": { status: "available" },
  "3": { status: "available" },
  "4": { status: "available" },
  "5": { status: "available" },
};

// Lock info structure: {lockedBy: 'userId', expiresAt: Date}
let seatLocks = {};

// Helper to clean expired locks
function cleanExpiredLocks() {
  const now = Date.now();
  Object.keys(seatLocks).forEach(seatId => {
    if (seatLocks[seatId].expiresAt <= now) {
      seats[seatId].status = 'available';
      delete seatLocks[seatId];
    }
  });
}

app.get('/seats', (req, res) => {
  cleanExpiredLocks();
  res.json(seats);
});

app.post('/lock/:seatId', (req, res) => {
  cleanExpiredLocks();
  const seatId = req.params.seatId;
  if (!seats[seatId]) return res.status(404).json({ message: "Seat not found" });
  if (seats[seatId].status !== "available") {
    return res.status(400).json({ message: "Seat is already locked or booked" });
  }
  seats[seatId].status = "locked";
  seatLocks[seatId] = {
    // In real system, associate a user/session. Here it's demo.
    lockedBy: "demoUser",
    expiresAt: Date.now() + SEAT_LOCK_DURATION
  };
  res.json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

app.post('/confirm/:seatId', (req, res) => {
  cleanExpiredLocks();
  const seatId = req.params.seatId;
  if (seats[seatId]?.status !== "locked" || !seatLocks[seatId]) {
    return res.status(400).json({ message: "Seat is not locked and cannot be booked" });
  }
  seats[seatId].status = "booked";
  delete seatLocks[seatId];
  res.json({ message: `Seat ${seatId} booked successfully!` });
});

app.listen(3000, () => console.log('App is running on port 3000.'));

