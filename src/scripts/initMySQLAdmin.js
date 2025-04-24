const bcrypt = require("bcryptjs");
const { pool } = require("../db");

async function initAdmin() {
  try {
    // 检查是否已存在管理员账号
    const [admins] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      ["admin"]
    );

    if (admins.length > 0) {
      console.log("管理员账号已存在");
      process.exit(0);
    }

    // 生成加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // 插入管理员账号
    const sql = `
      INSERT INTO users (username, password, nickname, email, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      "admin",
      hashedPassword,
      "管理员",
      "admin@example.com",
      "admin",
    ]);

    console.log("管理员账号创建成功");
    console.log("用户名: admin");
    console.log("密码: admin123");
    process.exit(0);
  } catch (error) {
    console.error("创建管理员账号失败:", error);
    process.exit(1);
  }
}

// 执行初始化
initAdmin();
