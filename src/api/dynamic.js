const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { pool } = require("../db");

// 获取动态列表
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, status } = req.query;

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
    let sql = `
      SELECT d.*, u.username, u.avatar 
      FROM dynamics d
      JOIN users u ON d.user_id = u.id 
      WHERE 1=1
    `;
    let countSql = `
      SELECT COUNT(*) as total 
      FROM dynamics d
      JOIN users u ON d.user_id = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    const countParams = [];

    // 动态添加条件
    if (username) {
      const usernameParam = `%${username}%`;
      sql += " AND u.username LIKE ?";
      countSql += " AND u.username LIKE ?";
      queryParams.push(usernameParam);
      countParams.push(usernameParam);
    }

    if (status !== undefined) {
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        sql += " AND d.status = ?";
        countSql += " AND d.status = ?";
        queryParams.push(statusNum);
        countParams.push(statusNum);
      }
    }

    // 添加排序和分页
    sql += ` ORDER BY d.created_at DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;
    queryParams.push(Number(offset), Number(pageSizeNum));

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
    console.error("获取动态列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取动态列表失败",
      error: error.message,
    });
  }
});

// 获取动态详情
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT d.*, u.username, u.avatar
      FROM dynamics d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `;

    const [rows] = await pool.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        error: "未找到指定ID的动态",
      });
    }

    res.json({
      code: 0,
      message: "获取成功",
      data: rows[0],
    });
  } catch (error) {
    console.error("获取动态详情失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取动态详情失败",
      error: error.message,
    });
  }
});

// 审核动态
router.post("/:id/review", verifyToken, async (req, res) => {
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
      UPDATE dynamics 
      SET status = ?, review_comment = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [status, reviewComment, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        error: "未找到指定ID的动态",
      });
    }

    res.json({
      code: 0,
      message: "审核成功",
    });
  } catch (error) {
    console.error("审核动态失败:", error);
    res.status(500).json({
      code: 500,
      message: "审核动态失败",
      error: error.message,
    });
  }
});

// 删除动态
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM dynamics WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
        error: "未找到指定ID的动态",
      });
    }

    res.json({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除动态失败:", error);
    res.status(500).json({
      code: 500,
      message: "删除动态失败",
      error: error.message,
    });
  }
});

module.exports = router;
