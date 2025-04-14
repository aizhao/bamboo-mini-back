const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const orderRoutes = require("./orderRoutes");
const footprintRoutes = require("./footprintRoutes");
const favoriteRoutes = require("./favoriteRoutes");

router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/footprints", footprintRoutes);
router.use("/favorites", favoriteRoutes);

module.exports = router;
