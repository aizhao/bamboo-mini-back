const express = require("express");
const router = express.Router();

// 注册路由
router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/products", require("./products"));
router.use("/orders", require("./orders"));
router.use("/footprints", require("./footprints"));
router.use("/favorites", require("./favorites"));

module.exports = router;
