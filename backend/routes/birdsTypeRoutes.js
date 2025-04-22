// routes/birdTypeRoutes.js
const express = require("express");
const router = express.Router();
const birdTypeController = require("../controllers/birdsTypeController");

// BirdType routes
router.get("/", birdTypeController.getAllbirdsType);
router.get("/:id", birdTypeController.getBirdTypeById);
router.post("/", birdTypeController.createBirdType);
router.put("/:id", birdTypeController.updateBirdType);
router.delete("/:id", birdTypeController.deleteBirdType);

module.exports = router;
