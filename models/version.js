'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class version extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  version.init({
     id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      version_app_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      version_play_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url_app_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url_play_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      version_info_app_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      version_info_play_store: {
        type: DataTypes.STRING,
        allowNull: true
      },
      version_date_app_store: {
        type: DataTypes.DATE,
      },
      version_date_play_store: {
        type: DataTypes.DATE,
      },
  }, {
    sequelize,
    modelName: 'version',
  });
  return version;
};