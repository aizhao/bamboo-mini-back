const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");
const adminModel = require("../model/admin");

// 管理员登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找管理员
    const admin = await adminModel.findByUsername(username);
    if (!admin) {
      return res.status(401).json({
        code: 401,
        message: "账号不存在",
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: "用户名或密码错误",
      });
    }

    // 检查状态
    if (admin.status !== 1) {
      return res.status(403).json({
        code: 403,
        message: "账号已被禁用",
      });
    }

    // 更新最后登录时间
    await adminModel.updateLastLoginTime(admin.id);

    // 生成token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      code: 0,
      message: "登录成功",
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error("管理员登录失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

// 获取管理员信息
router.get("/info", verifyToken, async (req, res) => {
  try {
    const admin = await adminModel.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: "管理员不存在",
      });
    }

    res.json({
      code: 0,
      message: "获取成功",
      data: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        email: admin.email,
        role: admin.role,
        lastLoginTime: admin.last_login_time,
      },
    });
  } catch (error) {
    console.error("获取管理员信息失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

// 获取管理员列表
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { page, pageSize, username, role, status } = req.query;
    const params = {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      username,
      role,
      status: status !== undefined ? parseInt(status) : undefined,
    };

    const { rows, total } = await adminModel.getAdminList(params);

    res.json({
      code: 0,
      message: "获取成功",
      data: {
        list: rows,
        total,
        page: params.page,
        pageSize: params.pageSize,
      },
    });
  } catch (error) {
    console.error("获取管理员列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

// 创建管理员
router.post("/create", verifyToken, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        code: 403,
        message: "无权限",
      });
    }

    const { username, password, nickname, email, role } = req.body;

    // 检查用户名是否已存在
    const existingAdmin = await adminModel.findByUsername(username);
    if (existingAdmin) {
      return res.status(400).json({
        code: 400,
        message: "用户名已存在",
      });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建管理员
    const id = await adminModel.createAdmin({
      username,
      password: hashedPassword,
      nickname,
      email,
      role,
    });

    res.json({
      code: 0,
      message: "创建成功",
      data: { id },
    });
  } catch (error) {
    console.error("创建管理员失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

// 更新管理员
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        code: 403,
        message: "无权限",
      });
    }

    const { id } = req.params;
    const { nickname, email, role, status } = req.body;

    // 检查管理员是否存在
    const admin = await adminModel.findById(id);
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: "管理员不存在",
      });
    }

    // 更新管理员
    const success = await adminModel.updateAdmin(id, {
      nickname,
      email,
      role,
      status,
    });

    if (!success) {
      return res.status(500).json({
        code: 500,
        message: "更新失败",
      });
    }

    res.json({
      code: 0,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新管理员失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

// 删除管理员
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    // 检查权限
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        code: 403,
        message: "无权限",
      });
    }

    const { id } = req.params;

    // 检查管理员是否存在
    const admin = await adminModel.findById(id);
    if (!admin) {
      return res.status(404).json({
        code: 404,
        message: "管理员不存在",
      });
    }

    // 不能删除自己
    if (admin.id === req.user.id) {
      return res.status(400).json({
        code: 400,
        message: "不能删除自己",
      });
    }

    // 删除管理员
    const success = await adminModel.deleteAdmin(id);

    if (!success) {
      return res.status(500).json({
        code: 500,
        message: "删除失败",
      });
    }

    res.json({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除管理员失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误",
    });
  }
});

module.exports = router;
