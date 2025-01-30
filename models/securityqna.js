'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SecurityQnA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

    }
  }
  SecurityQnA.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING
    },
    option: {
      type: DataTypes.ENUM(["security", "criminal_record"]),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'SecurityQnA',
  });
  return SecurityQnA;
};