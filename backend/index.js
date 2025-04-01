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

app.post("/species", async (req, res) => {
  try {
    const { botanyIds } = req.body;

    if (!Array.isArray(botanyIds) || botanyIds.length === 0) {
      return res
        .status(400)
        .json({ error: "botanyIds must be a non-empty array" });
    }

    // Validate that all elements are numbers
    if (botanyIds.some(isNaN)) {
      return res.status(400).json({ error: "Invalid botanyIds format" });
    }

    // Query the database
    const result = await pool.query(
      `SELECT id, scientificname FROM species WHERE botanyid = ANY($1)`,
      [botanyIds]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching species list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
