'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SuperAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  SuperAdmin.init({
     id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      delete_reason: {
        type: DataTypes.STRING,
        allowNull: true
      }
  }, {
    sequelize,
    modelName: 'SuperAdmin',
  });
  return SuperAdmin;
};