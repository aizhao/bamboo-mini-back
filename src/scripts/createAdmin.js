const bcrypt = require("bcryptjs");
const { pool } = require("../db");

async function createInitialAdmin() {
  try {
    // 检查是否已存在管理员
    const [admins] = await pool.execute("SELECT * FROM admins LIMIT 1");
    if (admins.length > 0) {
      console.log("已存在管理员账号，跳过创建");
      process.exit(0);
    }

    // 创建初始管理员
    const username = "admin";
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO admins (username, password, nickname, role, status)
      VALUES (?, ?, ?, 'super_admin', 1)
    `;

    await pool.execute(sql, [username, hashedPassword, "超级管理员"]);
    console.log("初始管理员创建成功");
    console.log("用户名:", username);
    console.log("密码:", password);
  } catch (error) {
    console.error("创建初始管理员失败:", error);
  } finally {
    process.exit(0);
  }
}

createInitialAdmin();
