const { pool } = require("../db");

// 根据用户名查找管理员
const findByUsername = async (username) => {
  const [rows] = await pool.execute("SELECT * FROM admins WHERE username = ?", [
    username,
  ]);
  return rows[0];
};

// 根据ID查找管理员
const findById = async (id) => {
  const [rows] = await pool.execute("SELECT * FROM admins WHERE id = ?", [id]);
  return rows[0];
};

// 更新管理员最后登录时间
const updateLastLoginTime = async (id) => {
  await pool.execute("UPDATE admins SET last_login_time = NOW() WHERE id = ?", [
    id,
  ]);
};

// 获取管理员列表
const getAdminList = async (params) => {
  const { page = 1, pageSize = 10, username, role, status } = params;
  const offset = (page - 1) * pageSize;

  let sql = "SELECT * FROM admins WHERE 1=1";
  const queryParams = [];

  if (username) {
    sql += " AND username LIKE ?";
    queryParams.push(`%${username}%`);
  }

  if (role) {
    sql += " AND role = ?";
    queryParams.push(role);
  }

  if (status !== undefined) {
    sql += " AND status = ?";
    queryParams.push(status);
  }

  sql += " ORDER BY create_time DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(pageSize), offset);

  const [rows] = await pool.execute(sql, queryParams);

  // 获取总数
  const countSql =
    "SELECT COUNT(*) as total FROM admins WHERE 1=1" +
    (username ? " AND username LIKE ?" : "") +
    (role ? " AND role = ?" : "") +
    (status !== undefined ? " AND status = ?" : "");

  const [totalResult] = await pool.execute(countSql, queryParams.slice(0, -2));
  const total = totalResult[0].total;

  return { rows, total };
};

// 创建管理员
const createAdmin = async (data) => {
  const { username, password, nickname, email, role } = data;

  const sql = `
    INSERT INTO admins (username, password, nickname, email, role)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.execute(sql, [
    username,
    password,
    nickname,
    email,
    role,
  ]);
  return result.insertId;
};

// 更新管理员
const updateAdmin = async (id, data) => {
  const { nickname, email, role, status } = data;

  const sql = `
    UPDATE admins 
    SET nickname = ?, email = ?, role = ?, status = ?
    WHERE id = ?
  `;

  const [result] = await pool.execute(sql, [nickname, email, role, status, id]);
  return result.affectedRows > 0;
};

// 删除管理员
const deleteAdmin = async (id) => {
  const [result] = await pool.execute("DELETE FROM admins WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  findByUsername,
  findById,
  updateLastLoginTime,
  getAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
