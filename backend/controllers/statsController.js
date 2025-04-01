const pool = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const speciesResult = await pool.query(
      "SELECT COUNT(*) AS speciesCount FROM Species"
    );
    const treeResult = await pool.query(
      "SELECT COUNT(*) AS treeCount FROM Trees_Geolocation"
    );
    const birdsResult = await pool.query("SELECT COUNT FROM Birds LIMIT 1");

    const speciesCount = speciesResult.rows[0].speciescount;
    const treeCount = treeResult.rows[0].treecount;
    const birdCount =
      birdsResult.rows.length > 0 ? birdsResult.rows[0].count : 0;

    res.json({ speciesCount, treeCount, birdCount });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
