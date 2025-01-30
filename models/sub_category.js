'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class sub_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      sub_category.belongsTo(models.Category, {
        foreignKey: 'category'
      })

      models.Category.hasMany(models.sub_category, {
        foreignKey: 'category'
      })

      // sub_category.belongsToMany(models.Category, {
      //   through:'category_subCategory'
      // })

      // models.Category.belongsToMany(models.sub_category, {
      //  through: 'category_subCategory'
      // })

      sub_category.belongsTo(models.SuperAdmin, {
        foreignKey: 'create_by'
      })

      models.SuperAdmin.hasMany(models.sub_category, {
        foreignKey: 'create_by'
      })

    //   sub_category.belongsToMany(models.SuperAdmin, {
    //     through: 'superadmin_sub_category_associate'
    //   })

    //   models.SuperAdmin.belongsToMany(models.sub_category, {
    //     through: 'superadmin_sub_category_associate'
    //   })
    }
  }
  sub_category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      category: {
        type: DataTypes.UUID,
        references: {
          model: 'Category',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category_image: {
        type: DataTypes.STRING,
        allowNull: false
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
      modelName: 'sub_category'
    }
  )
  return sub_category
}
