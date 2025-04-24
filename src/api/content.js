const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { pool } = require("../db");

// 获取内容列表
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, title, category, status } = req.query;

    // 强制转换为整数并校验
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;
    if (
      pageNum < 1 ||
      pageSizeNum < 1 ||
      isNaN(pageNum) ||
      isNaN(pageSizeNum)
    ) {
      return res.status(400).json({ code: 400, message: "分页参数无效" });
    }
    const offset = (pageNum - 1) * pageSizeNum;

    // 主查询和总数查询参数分离
    let sql = "SELECT * FROM contents WHERE 1=1";
    let countSql = "SELECT COUNT(*) as total FROM contents WHERE 1=1";
    const queryParams = [];
    const countParams = [];

    // 动态添加条件（保持顺序一致）
    if (title) {
      const titleParam = `%${title}%`;
      sql += " AND title LIKE ?";
      countSql += " AND title LIKE ?";
      queryParams.push(titleParam);
      countParams.push(titleParam);
    }

    if (category) {
      sql += " AND category = ?";
      countSql += " AND category = ?";
      queryParams.push(category);
      countParams.push(category);
    }

    if (status !== undefined) {
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        sql += " AND status = ?";
        countSql += " AND status = ?";
        queryParams.push(statusNum);
        countParams.push(statusNum);
      }
    }

    // 修改点1: 调整分页语法
    sql += ` ORDER BY create_time DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;
    // 修改点2: 参数顺序改为 [offset, pageSize]
    queryParams.push(Number(offset), Number(pageSizeNum)); // 显式转换类型

    // 执行主查询
    const [rows] = await pool.execute(sql, queryParams);

    // 执行总数查询
    const [total] = await pool.execute(countSql, countParams);

    res.json({
      code: 0,
      message: "获取成功",
      data: {
        list: rows,
        total: total[0].total,
        page: pageNum,
        pageSize: pageSizeNum,
      },
    });
  } catch (error) {
    console.error("获取内容列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取内容列表失败",
      error: error.message,
    });
  }
});

// 创建内容
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { title, content, category, tags, coverImage } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "标题、内容和分类为必填项",
      });
    }

    const sql = `
      INSERT INTO contents (title, content, author, category, tags, cover_image, status)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `;

    const [result] = await pool.execute(sql, [
      title,
      content,
      req.user.username,
      category,
      tags ? JSON.stringify(tags) : null,
      coverImage,
    ]);

    res.json({
      code: 0,
      message: "创建成功",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("创建内容失败:", error);
    res.status(500).json({
      code: 500,
      message: "创建内容失败",
      error: error.message,
    });
  }
});

// 更新内容
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, coverImage } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "标题、内容和分类为必填项",
      });
    }

    const sql = `
      UPDATE contents 
      SET title = ?, content = ?, category = ?, tags = ?, cover_image = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [
      title,
      content,
      category,
      tags ? JSON.stringify(tags) : null,
      coverImage,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "内容不存在",
        error: "未找到指定ID的内容",
      });
    }

    res.json({
      code: 0,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新内容失败:", error);
    res.status(500).json({
      code: 500,
      message: "更新内容失败",
      error: error.message,
    });
  }
});

// 删除内容
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM contents WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "内容不存在",
        error: "未找到指定ID的内容",
      });
    }

    res.json({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除内容失败:", error);
    res.status(500).json({
      code: 500,
      message: "删除内容失败",
      error: error.message,
    });
  }
});

// 审核内容
router.put("/review/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "审核状态为必填项",
      });
    }

    const sql = `
      UPDATE contents 
      SET status = ?, review_comment = ?, review_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [status, reviewComment, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "内容不存在",
        error: "未找到指定ID的内容",
      });
    }

    res.json({
      code: 0,
      message: "审核成功",
    });
  } catch (error) {
    console.error("审核内容失败:", error);
    res.status(500).json({
      code: 500,
      message: "审核内容失败",
      error: error.message,
    });
  }
});

module.exports = router;
