require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 3000;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Route to fetch botany list
app.get("/botany", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Botany ORDER BY ID ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching botany list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
