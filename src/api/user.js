const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { verifyToken } = require("../middleware/auth");

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { username, password, nickname, email } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "用户名和密码为必填项",
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        code: 400,
        message: "用户名已存在",
        error: "该用户名已被注册",
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const [result] = await pool.execute(
      "INSERT INTO users (username, password, nickname, email, role) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, nickname || username, email || null, "user"]
    );

    res.json({
      code: 0,
      message: "注册成功",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("用户注册失败:", error);
    res.status(500).json({
      code: 500,
      message: "注册失败",
      error: error.message,
    });
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "用户名和密码为必填项",
      });
    }

    // 查询用户
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        error: "用户不存在",
      });
    }

    const user = users[0];

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
        error: "密码不正确",
      });
    }

    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      code: 0,
      message: "登录成功",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("用户登录失败:", error);
    res.status(500).json({
      code: 500,
      message: "登录失败",
      error: error.message,
    });
  }
});

// 获取用户信息
router.get("/info", verifyToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, nickname, email, role, create_time FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        error: "未找到指定用户",
      });
    }

    res.json({
      code: 0,
      message: "获取成功",
      data: users[0],
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取用户信息失败",
      error: error.message,
    });
  }
});

// 更新用户信息
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { nickname, email, password } = req.body;

    let sql = "UPDATE users SET ";
    const params = [];

    if (nickname) {
      sql += "nickname = ?, ";
      params.push(nickname);
    }

    if (email) {
      sql += "email = ?, ";
      params.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      sql += "password = ?, ";
      params.push(hashedPassword);
    }

    sql = sql.slice(0, -2) + " WHERE id = ?";
    params.push(req.user.id);

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
        error: "未找到指定用户",
      });
    }

    res.json({
      code: 0,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新用户信息失败:", error);
    res.status(500).json({
      code: 500,
      message: "更新用户信息失败",
      error: error.message,
    });
  }
});
// 获取用户列表（管理员权限）
router.get("/list", verifyToken, async (req, res) => {
  try {
    // 权限验证：仅管理员可访问
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        code: 403,
        message: "无操作权限",
        error: "仅管理员可访问用户列表",
      });
    }

    // 解析请求参数
    const {
      page = 1,
      pageSize = 10,
      username,
      nickname,
      email,
      role,
    } = req.query;

    // 分页参数校验
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 10;
    if (pageNum < 1 || pageSizeNum < 1) {
      return res.status(400).json({
        code: 400,
        message: "分页参数无效",
        error: "页码和每页数量必须大于0",
      });
    }
    const offset = (pageNum - 1) * pageSizeNum;

    // 动态构建SQL
    let sql = `SELECT id, username, nickname, email, role,status, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at FROM users WHERE 1=1`;
    let countSql = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const queryParams = [];
    const countParams = [];

    // 添加筛选条件
    if (username) {
      const usernameParam = `%${username}%`;
      sql += " AND username LIKE ?";
      countSql += " AND username LIKE ?";
      queryParams.push(usernameParam);
      countParams.push(usernameParam);
    }

    if (nickname) {
      const nicknameParam = `%${nickname}%`;
      sql += " AND nickname LIKE ?";
      countSql += " AND nickname LIKE ?";
      queryParams.push(nicknameParam);
      countParams.push(nicknameParam);
    }

    if (email) {
      const emailParam = `%${email}%`;
      sql += " AND email LIKE ?";
      countSql += " AND email LIKE ?";
      queryParams.push(emailParam);
      countParams.push(emailParam);
    }

    if (role) {
      sql += " AND role = ?";
      countSql += " AND role = ?";
      queryParams.push(role);
      countParams.push(role);
    }

    // 分页参数处理
    // sql += " ORDER BY create_time DESC LIMIT ?, ?";
    queryParams.push(offset, pageSizeNum);

    // 执行查询
    const [rows] = await pool.execute(sql, queryParams);
    const [totalResult] = await pool.execute(countSql, countParams);
    res.json({
      code: 0,
      message: "获取成功",
      data: {
        list: rows,
        total: totalResult[0].total,
        page: pageNum,
        pageSize: pageSizeNum,
      },
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
      error: error.message,
    });
  }
});

module.exports = router;
