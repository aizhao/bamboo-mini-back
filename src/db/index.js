const mysql = require("mysql2/promise");
const config = require("../../config/database");

const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: config.pool.max,
  queueLimit: 0,
});

// 测试数据库连接
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL数据库连接成功");
    connection.release();
  } catch (error) {
    console.error("MySQL数据库连接失败:", error);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
