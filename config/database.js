require("dotenv").config();

module.exports = {
  host: process.env.DB_HOST || "47.108.223.229",
  username: process.env.DB_USER || "bamboo-mini",
  password: process.env.DB_PASSWORD || "XEFfsAxZkk87JE6K",
  database: process.env.DB_NAME || "bamboo-mini",
  dialect: process.env.DB_DIALECT || "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
