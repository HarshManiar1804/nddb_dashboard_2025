const express = require("express");
const {
  getSpeciesByBotany,
  getSpeciesDetails,
} = require("../controllers/speciesController");

const router = express.Router();

router.post("/", getSpeciesByBotany);
router.get("/details/:treeGeoID", getSpeciesDetails);

module.exports = router;
