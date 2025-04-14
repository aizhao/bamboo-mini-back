const { Sequelize } = require("sequelize");
const config = require("../config/database");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  }
);

const User = require("./user")(sequelize);
const Product = require("./product")(sequelize);
const Order = require("./order")(sequelize);
const OrderItem = require("./orderItem")(sequelize);
const Footprint = require("./footprint")(sequelize);
const Favorite = require("./favorite")(sequelize);

// Define relationships
User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Footprint, { foreignKey: "user_id" });
Footprint.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Footprint, { foreignKey: "product_id" });
Footprint.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(Favorite, { foreignKey: "user_id" });
Favorite.belongsTo(User, { foreignKey: "user_id" });

Product.hasMany(Favorite, { foreignKey: "product_id" });
Favorite.belongsTo(Product, { foreignKey: "product_id" });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Footprint,
  Favorite,
};
