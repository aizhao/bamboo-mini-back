const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { pool } = require("../db");
function convertUTCToBeijing(utcString) {
  const date = new Date(utcString);
  // 添加8小時的毫秒數
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

  // 格式化成北京時間的字符串（YYYY-MM-DD HH:mm:ss）
  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(beijingTime.getUTCDate()).padStart(2, "0");
  const hours = String(beijingTime.getUTCHours()).padStart(2, "0");
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(beijingTime.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
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
      SELECT 
        d.id,
        d.content,
        d.media,
        d.location,
        d.created_at as time,
        d.likes,
        d.is_liked,
        d.comments,
        u.avatar,
        u.nickname
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
        list: rows.map((row) => ({
          id: row.id,
          user: {
            avatar: row.avatar,
            nickname: row.nickname,
          },
          time: convertUTCToBeijing(row.time),
          content: row.content,
          media:
            typeof row.media === "string"
              ? JSON.parse(row.media || "[]")
              : row.media || [],
          location: row.location,
          likes: row.likes,
          isLiked: row.is_liked,
          comments:
            typeof row.comments === "string"
              ? JSON.parse(row.comments || "[]")
              : row.comments || [],
        })),
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

// 添加评论
router.post("/:id/comments", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // 从token中获取用户ID

    if (!content) {
      return res.status(400).json({
        code: 400,
        message: "评论内容不能为空",
      });
    }

    // 首先获取用户信息
    const [userRows] = await pool.execute(
      "SELECT nickname FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "用户不存在",
      });
    }

    // 获取当前动态的评论
    const [dynamicRows] = await pool.execute(
      "SELECT comments FROM dynamics WHERE id = ?",
      [id]
    );

    if (dynamicRows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "动态不存在",
      });
    }

    console.log("Existing comments from DB:", dynamicRows[0].comments);

    // 构建新评论
    const newComment = {
      user: userRows[0].nickname,
      content: content,
      created_at: new Date().toISOString(),
    };

    // 获取现有评论并添加新评论
    let currentComments = [];
    try {
      // 确保comments字段存在且不为null
      const existingComments = dynamicRows[0].comments;
      if (existingComments) {
        currentComments =
          typeof existingComments === "string"
            ? JSON.parse(existingComments)
            : existingComments;
      }
    } catch (e) {
      currentComments = [];
    }

    // 确保currentComments是数组
    if (!Array.isArray(currentComments)) {
      currentComments = [];
    }

    currentComments.push(newComment);

    // 更新动态的评论
    const [result] = await pool.execute(
      "UPDATE dynamics SET comments = ? WHERE id = ?",
      [JSON.stringify(currentComments), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: "更新评论失败",
      });
    }

    // 验证更新后的评论
    const [verifyRows] = await pool.execute(
      "SELECT comments FROM dynamics WHERE id = ?",
      [id]
    );

    res.json({
      code: 0,
      message: "评论成功",
      data: newComment,
    });
  } catch (error) {
    console.error("添加评论失败:", error);
    res.status(500).json({
      code: 500,
      message: "添加评论失败",
      error: error.message,
    });
  }
});

module.exports = router;
