const express = require("express");
const {
  getGeolocationBySpecies,
} = require("../controllers/geolocationController");

const router = express.Router();

router.post("/", getGeolocationBySpecies);

module.exports = router;
