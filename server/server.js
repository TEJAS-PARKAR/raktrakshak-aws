const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mongoose = require("mongoose")

const app = express(); // Initialize Express

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Database Connected"))
.catch(err => console.log("Database Error:", err))

// Middleware
app.set("trust proxy", 1); // Trust Render's reverse proxy
app.use(cors({
  origin: [process.env.CLIENT_URL],
  credentials: true,
})); // Enable CORS for frontend with credentials

const morgan = require("morgan");
app.use(morgan("dev"));

app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies

// Test Route
app.get("/", (req, res) => {
  res.send("Blood Bank API Running");
});

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const requestRoutes = require("./routes/requestRoutes");
app.use("/api/requests", requestRoutes);

const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api/inventory", inventoryRoutes);

const passport = require("./config/passport");
app.use(passport.initialize());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler); // Use the error handling middleware

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});