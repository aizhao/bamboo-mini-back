const { pool } = require("../db");

// 创建3D模型表
const createModel3DTable = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS model3d (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        model_url VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(255),
        tags JSON,
        size INT NOT NULL,
        format VARCHAR(20) NOT NULL,
        author VARCHAR(100) NOT NULL,
        status TINYINT DEFAULT 0,
        review_comment TEXT,
        review_time DATETIME,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.execute(sql);
    console.log("3D模型表创建成功");
  } catch (error) {
    console.error("创建3D模型表失败:", error);
    throw error;
  }
};

// 初始化表
createModel3DTable();

// 导出模型操作方法
module.exports = {
  // 获取3D模型列表
  getModel3DList: async (params) => {
    const { page = 1, pageSize = 10, name, category, status } = params;
    const offset = (page - 1) * pageSize;

    let sql = "SELECT * FROM model3ds WHERE 1=1";
    const queryParams = [];

    if (name) {
      sql += " AND name LIKE ?";
      queryParams.push(`%${name}%`);
    }

    if (category) {
      sql += " AND category = ?";
      queryParams.push(category);
    }
    // if (status) {
    //   sql += " AND status = ?";
    //   queryParams.push(status);
    // }

    // sql += " ORDER BY create_time DESC LIMIT ? OFFSET ?";
    queryParams.push(parseInt(pageSize), offset);

    const [rows] = await pool.execute(sql, queryParams);
    // 获取总数s
    const countSql =
      "SELECT COUNT(*) as total FROM model3d WHERE 1=1" +
      (name ? " AND name LIKE ?" : "") +
      (category ? " AND category = ?" : "");
    // (status !== undefined ? " AND status = ?" : "");

    const [totalResult] = await pool.execute(
      countSql,
      queryParams.slice(0, -2)
    );
    const total = totalResult[0].total;
    return { rows, total };
  },

  // 获取单个3D模型
  getModel3DById: async (id) => {
    const [rows] = await pool.execute("SELECT * FROM model3ds WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  // 创建3D模型
  createModel3D: async (data) => {
    const {
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
      author,
    } = data;

    const sql = `
      INSERT INTO model3d (name, description, category, model_url, thumbnail_url, tags, size, format, author)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      name,
      description || "",
      category,
      modelUrl,
      thumbnailUrl || "",
      tags ? JSON.stringify(tags) : null,
      size,
      format,
      author,
    ]);

    return result.insertId;
  },

  // 更新3D模型
  updateModel3D: async (id, data) => {
    const {
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
    } = data;

    const sql = `
      UPDATE model3d 
      SET name = ?, description = ?, category = ?, model_url = ?, thumbnail_url = ?, tags = ?, size = ?, format = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [
      name,
      description || "",
      category,
      modelUrl,
      thumbnailUrl || "",
      tags ? JSON.stringify(tags) : null,
      size,
      format,
      id,
    ]);

    return result.affectedRows > 0;
  },

  // 删除3D模型
  deleteModel3D: async (id) => {
    const [result] = await pool.execute("DELETE FROM model3d WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },

  // 审核3D模型
  reviewModel3D: async (id, status, reviewComment) => {
    const sql = `
      UPDATE model3d 
      SET status = ?, review_comment = ?, review_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.execute(sql, [status, reviewComment || "", id]);
    return result.affectedRows > 0;
  },
};
