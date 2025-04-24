const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./src/db");
const adminRouter = require("./src/api/admin");
const userRouter = require("./src/api/user");
const contentRouter = require("./src/api/content");
const model3dRouter = require("./src/api/model3d");
const uploadRouter = require("./src/api/upload");
const dynamicRouter = require("./src/api/dynamic");

const app = express();

// 连接数据库
connectDB().catch((err) => {
  console.error("数据库连接失败:", err);
  process.exit(1);
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// API路由
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/content", contentRouter);
app.use("/api/model3d", model3dRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dynamic", dynamicRouter);

// 错误处理
app.use((err, req, res, next) => {
  console.error("错误详情:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });
  res.status(500).json({
    code: 500,
    message: err.message || "服务器错误",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
