const express = require("express");
const { getBotanyList } = require("../controllers/botanyControllers");

const router = express.Router();

router.get("/", getBotanyList);

module.exports = router;
