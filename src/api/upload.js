const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/auth");

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 配置文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    "image/jpeg": true,
    "image/png": true,
    "image/gif": true,
    "model/gltf-binary": true,
    "model/gltf+json": true,
    "application/x-tgif": true, // obj文件
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("不支持的文件类型"), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 限制文件大小为50MB
  },
});

// 文件上传接口
router.post("/", verifyToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: "请选择要上传的文件",
        error: "未检测到上传的文件",
      });
    }

    // 返回文件信息
    res.json({
      code: 0,
      message: "上传成功",
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("文件上传失败:", error);
    res.status(500).json({
      code: 500,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

module.exports = router;
