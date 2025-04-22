// controllers/birdTypeController.js
const db = require("../config/db");

// Get all bird types
const getAllbirdsType = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM birds_type");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching bird types:", error);
    res.status(500).json({ error: "Failed to fetch bird types" });
  }
};

// Get a specific bird type by ID
const getBirdTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM birds_type WHERE Id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching bird type:", error);
    res.status(500).json({ error: "Failed to fetch bird type" });
  }
};

// Create a new bird type
const createBirdType = async (req, res) => {
  const { type, hindi } = req.body;

  if (!type) {
    return res.status(400).json({ error: "type is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO birds_type (type, hindi) VALUES ($1, $2) RETURNING *",
      [type, hindi]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating bird type:", error);
    res.status(500).json({ error: "Failed to create bird type" });
  }
};

// Update a bird type
const updateBirdType = async (req, res) => {
  const { id } = req.params;
  const { type, hindi } = req.body;

  if (!type) {
    return res.status(400).json({ error: "type is required" });
  }

  try {
    const result = await db.query(
      "UPDATE birds_type SET type = $1, hindi = $2 WHERE Id = $3 RETURNING *",
      [type, hindi, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bird type:", error);
    res.status(500).json({ error: "Failed to update bird type" });
  }
};

// Delete a bird type
const deleteBirdType = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if any birds are using this type
    const birdCheck = await db.query(
      "SELECT COUNT(*) FROM Birds WHERE birds_type = $1",
      [id]
    );

    if (parseInt(birdCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "Cannot delete bird type that is being used by birds. Update those birds first.",
      });
    }

    const result = await db.query(
      "DELETE FROM birds_type WHERE Id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json({ message: "Bird type deleted successfully" });
  } catch (error) {
    console.error("Error deleting bird type:", error);
    res.status(500).json({ error: "Failed to delete bird type" });
  }
};

module.exports = {
  getAllbirdsType,
  getBirdTypeById,
  createBirdType,
  updateBirdType,
  deleteBirdType,
};
