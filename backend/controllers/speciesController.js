const pool = require("../config/db");

exports.getSpeciesByBotany = async (req, res) => {
  try {
    const { botanyIds } = req.body;

    if (!Array.isArray(botanyIds) || botanyIds.length === 0) {
      return res
        .status(400)
        .json({ error: "botanyIds must be a non-empty array" });
    }

    if (botanyIds.some(isNaN)) {
      return res.status(400).json({ error: "Invalid botanyIds format" });
    }

    const result = await pool.query(
      "SELECT id, scientificname FROM species WHERE botanyid = ANY($1)",
      [botanyIds]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching species list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSpeciesDetails = async (req, res) => {
  try {
    const { treeGeoID } = req.params;

    const query = `
      SELECT 
        s.*, 
        tg.Latitude, 
        tg.Longitude,
        ti.ImageURL AS TreeImageURL
      FROM Species s
      JOIN trees_geolocation tg ON s.id = tg.speciesid
      LEFT JOIN trees_image ti ON s.id = ti.speciesid AND ti.imagetype = 'Tree'
      WHERE tg.id = $1;
    `;

    const result = await pool.query(query, [treeGeoID]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Species not found for given tree geolocation ID." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching species details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
