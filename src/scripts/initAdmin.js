const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { User } = require("../model/user");

// 连接数据库
mongoose
  .connect("mongodb://localhost:27017/bamboo")
  .then(() => {
    console.log("数据库连接成功");
    return initAdmin();
  })
  .then(() => {
    console.log("初始化完成");
    process.exit(0);
  })
  .catch((error) => {
    console.error("错误:", error);
    process.exit(1);
  });

async function initAdmin() {
  try {
    // 检查是否已存在管理员账号
    const adminExists = await User.findOne({ username: "admin" });
    if (adminExists) {
      console.log("管理员账号已存在");
      return;
    }

    // 创建管理员账号
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const admin = new User({
      username: "admin",
      password: hashedPassword,
      nickname: "管理员",
      email: "admin@example.com",
      role: "admin",
      status: 1,
    });

    await admin.save();
    console.log("管理员账号创建成功");
    console.log("用户名: admin");
    console.log("密码: admin123");
  } catch (error) {
    console.error("创建管理员账号失败:", error);
    throw error;
  }
}
