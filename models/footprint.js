const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Footprint = sequelize.define(
    "Footprint",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "footprints",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return Footprint;
};
