const express = require("express");
const router = express.Router();
const { Footprint, Product } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Add footprint
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create footprint
    const footprint = await Footprint.create({
      user_id: req.user.id,
      product_id,
    });

    res.status(201).json(footprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's footprints
router.get("/my-footprints", authenticateUser, async (req, res) => {
  try {
    const footprints = await Footprint.findAll({
      where: { user_id: req.user.id },
      include: [Product],
      order: [["created_at", "DESC"]],
    });
    res.json(footprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
