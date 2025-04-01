const pool = require("../config/db");

exports.getBotanyList = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Botany ORDER BY ID ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching botany list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
