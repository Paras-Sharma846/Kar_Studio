const express = require("express");
const userRoutes = require("./auth");
const router = express.Router();

router.use("/users", userRoutes);

module.exports = router;
