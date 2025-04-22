// controllers/birdController.js
const db = require("../config/db");

// Get all birds (simplified to focus on Birds table)
const getAllBirds = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM Birds");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching birds:", error);
    res.status(500).json({ error: "Failed to fetch birds" });
  }
};

// Get all birds (with option to include inactive birds)
const getAllBirdsWithFilter = async (req, res) => {
  try {
    const { showInactive } = req.query;

    let query = "SELECT * FROM Birds";
    if (showInactive !== "true") {
      query += " WHERE IsActive = true";
    }
    query += " ORDER BY BirdName";

    const result = await db.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching birds:", error);
    res.status(500).json({ error: "Failed to fetch birds" });
  }
};

// Get a specific bird by ID (without joining BirdTypes)
const getBirdById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM Birds WHERE Id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching bird:", error);
    res.status(500).json({ error: "Failed to fetch bird" });
  }
};

// Create a new bird
const createBird = async (req, res) => {
  const {
    birdname,
    scientificname,
    birds_type,
    iucnstatus,
    migrationstatus,
    foodpreference,
    habitatpreference,
    globaldistribution,
    ecologicalrole,
    birdimage,
    urllink,
    coordinates,
    isactive,
    qrcode,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO birds (
        birdname, scientificname, birds_type, iucnstatus, migrationstatus, 
        foodpreference, habitatpreference, globaldistribution, ecologicalrole, 
        birdimage, urllink, coordinates, isactive, qrcode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        birdname,
        scientificname,
        birds_type,
        iucnstatus,
        migrationstatus,
        foodpreference,
        habitatpreference,
        globaldistribution,
        ecologicalrole,
        birdimage,
        urllink,
        coordinates,
        isactive ?? true,
        qrcode,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating bird:", error);
    res.status(500).json({ error: "Failed to create bird" });
  }
};

// Update a bird
// Update a bird
const updateBird = async (req, res) => {
  const { id } = req.params;
  const {
    birdname,
    scientificname,
    birds_type,
    iucnstatus,
    migrationstatus,
    foodpreference,
    habitatpreference,
    globaldistribution,
    ecologicalrole,
    birdimage,
    urllink,
    coordinates,
    isactive,
    qrcode,
  } = req.body;

  try {
    // First check if bird exists
    const checkResult = await db.query("SELECT * FROM birds WHERE id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    const result = await db.query(
      `UPDATE birds SET 
        birdname = $1, 
        scientificname = $2, 
        birds_type = $3, 
        iucnstatus = $4, 
        migrationstatus = $5,
        foodpreference = $6, 
        habitatpreference = $7, 
        globaldistribution = $8, 
        ecologicalrole = $9,
        birdimage = $10, 
        urllink = $11, 
        coordinates = $12, 
        isactive = $13, 
        qrcode = $14
      WHERE id = $15 RETURNING *`,
      [
        birdname,
        scientificname,
        birds_type,
        iucnstatus,
        migrationstatus,
        foodpreference,
        habitatpreference,
        globaldistribution,
        ecologicalrole,
        birdimage,
        urllink,
        coordinates,
        isactive ?? true,
        qrcode,
        id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bird:", error);
    res.status(500).json({ error: "Failed to update bird" });
  }
};

// Delete a bird
const deleteBird = async (req, res) => {
  const { id } = req.params;

  try {
    // First check if bird exists
    const checkResult = await db.query("SELECT * FROM Birds WHERE Id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    await db.query("DELETE FROM Birds WHERE Id = $1", [id]);
    res.status(200).json({ message: "Bird deleted successfully" });
  } catch (error) {
    console.error("Error deleting bird:", error);
    res.status(500).json({ error: "Failed to delete bird" });
  }
};

// Set bird active status
const setBirdActiveStatus = async (req, res) => {
  const { id } = req.params;
  const { IsActive } = req.body;

  if (IsActive === undefined) {
    return res.status(400).json({ error: "IsActive status is required" });
  }

  try {
    const result = await db.query(
      "UPDATE Birds SET IsActive = $1 WHERE Id = $2 RETURNING *",
      [IsActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bird active status:", error);
    res.status(500).json({ error: "Failed to update bird active status" });
  }
};

// Get birds by type
const getBirdsByType = async (req, res) => {
  const { typeId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM Birds WHERE BirdType = $1 ORDER BY BirdName",
      [typeId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching birds by type:", error);
    res.status(500).json({ error: "Failed to fetch birds by type" });
  }
};

// Search birds
const searchBirds = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM Birds 
       WHERE BirdName ILIKE $1 
       OR ScientificName ILIKE $1
       OR IUCNStatus ILIKE $1
       OR MigrationStatus ILIKE $1
       ORDER BY BirdName`,
      [`%${query}%`]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error searching birds:", error);
    res.status(500).json({ error: "Failed to search birds" });
  }
};

module.exports = {
  getAllBirds,
  getAllBirdsWithFilter,
  getBirdById,
  createBird,
  updateBird,
  deleteBird,
  setBirdActiveStatus,
  getBirdsByType,
  searchBirds,
};
