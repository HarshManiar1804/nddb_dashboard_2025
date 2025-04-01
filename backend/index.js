const express = require("express");
const cors = require("cors");

const botanyRoutes = require("./routes/botanyRoutes");
const speciesRoutes = require("./routes/speciesRoutes");
const geolocationRoutes = require("./routes/geolocationRoutes");
const statsRoutes = require("./routes/statsRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/botany", botanyRoutes);
app.use("/species", speciesRoutes);
app.use("/geolocation", geolocationRoutes);
app.use("/stats", statsRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
