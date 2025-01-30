'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Category.belongsTo(models.SuperAdmin, {
        foreignKey: 'create_by',
        as: 'superadmin'
      })
      models.SuperAdmin.hasMany(models.Category, {
        foreignKey: 'create_by',
        as: 'category'
      })
    }
  }
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category_img: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category_background_color: {
        type: DataTypes.STRING
      },
      create_by: {
        type: DataTypes.UUID,
        references: {
          model: 'SuperAdmin',
          key: 'id'
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'Category'
    }
  )
  return Category
}
