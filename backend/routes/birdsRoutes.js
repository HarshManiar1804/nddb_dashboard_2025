// routes/birdRoutes.js
const express = require("express");
const router = express.Router();
const birdController = require("../controllers/birdsController");

// Bird routes
router.get("/", birdController.getAllBirds);
router.get("/:id", birdController.getBirdById);
router.post("/", birdController.createBird);
router.put("/:id", birdController.updateBird);
router.delete("/:id", birdController.deleteBird);
router.patch("/:id/status", birdController.setBirdActiveStatus);

module.exports = router;
