const express = require("express");
const router = express.Router();
const { Favorite, Product } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Add to favorites
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id,
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Create favorite
    const favorite = await Favorite.create({
      user_id: req.user.id,
      product_id,
    });

    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete("/:productId", authenticateUser, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id: req.params.productId,
      },
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await favorite.destroy();
    res.json({ message: "Favorite removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's favorites
router.get("/my-favorites", authenticateUser, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [Product],
      order: [["created_at", "DESC"]],
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
