const pool = require("../config/db");

exports.getGeolocationBySpecies = async (req, res) => {
  try {
    const { speciesIDs } = req.body;

    if (!Array.isArray(speciesIDs) || speciesIDs.length === 0) {
      return res.status(400).json({ error: "speciesIDs array is required" });
    }

    const query = `
      SELECT 
        s.ID AS SpeciesID,
        s.TreeName,
        t.Latitude,
        t.Longitude
      FROM 
        Trees_Geolocation t
      INNER JOIN 
        Species s ON t.SpeciesID = s.ID
      WHERE 
        s.ID = ANY($1)
    `;

    const result = await pool.query(query, [speciesIDs]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
