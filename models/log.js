'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        // Log.belongsTo(models.Vendor)
        // Log.belongsTo(models.Customer)

        // models.Customer.hasMany(models.Log);
        // models.Vendor.hasMany(models.Log);

    }
  }
  Log.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
  },
  option: {
      type: DataTypes.ENUM(['Password_Upadate'])
  },
  createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
  },
  updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
  },
  }, {
    sequelize,
    modelName: 'Log',
  });
  return Log;
};