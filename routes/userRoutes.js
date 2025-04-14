const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Get user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", authenticateUser, async (req, res) => {
  try {
    const { nickname, avatar, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar,
      phone: phone || user.phone,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
