import express from "express";
import bodyParser from "body-parser";
import bookingRoutes from "./routes/booking.js";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("🎟️ Ticket Booking API Running!");
});

app.use("/api", bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
