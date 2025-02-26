const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const cardRoutes = require("./routes/cards");
const dateRoutes = require("./routes/dates");
const placeRoutes = require("./routes/places");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category")

const app = express();
const PORT = 5000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", cardRoutes);
app.use("/api", dateRoutes);
app.use("/api", placeRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log(`🐎🐎🐎Server running on port ${PORT}🐎🐎🐎`);
});