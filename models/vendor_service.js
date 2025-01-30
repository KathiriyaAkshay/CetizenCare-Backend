'use strict'
const { Model } = require('sequelize')
const vendor = require('./vendor')
module.exports = (sequelize, DataTypes) => {
  class vendor_service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here

      vendor_service.belongsTo(models.Category, {
        foreignKey: 'category'
      })
      models.Category.hasMany(models.vendor_service, {
        foreignKey: 'category'
      })

      vendor_service.belongsTo(models.sub_category, {
        foreignKey: 'subcategory'
      })

      models.sub_category.hasMany(models.vendor_service, {
        foreignKey: 'subcategory'
      })

      vendor_service.belongsTo(models.Vendor, {
        foreignKey: 'vendor'
      })

      models.Vendor.hasMany(models.vendor_service, {
        foreignKey: 'vendor'
      })

      vendor_service.belongsTo(models.vendor_postal_address, {
        foreignKey: 'address'
      })

      models.vendor_postal_address.hasMany(models.vendor_service, {
        foreignKey: 'address'
      })
    }
  }
  vendor_service.init(
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
      subcategory: {
        type: DataTypes.UUID,
        references: {
          model: 'sub_category',
          key: 'id'
        }
      },
      //   name: {
      //     type: DataTypes.STRING,
      //     allowNull: false
      //   },
      price: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        allowNull: false
      },
      previous_experience: {
        type: DataTypes.JSON,
        allowNull: false
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      timeslot: {
        type: DataTypes.JSON,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      images: {
        type: DataTypes.JSON
      },
      rating: {
        type: DataTypes.DECIMAL(3, 1)
      },
      on_leave: {
        type: DataTypes.BOOLEAN
      },
      leave_start_date: {
        type: DataTypes.STRING
      },
      leave_end_date: {
        type: DataTypes.STRING
      },
      vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      address: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_postal_address',
          key: 'id'
        }
      },
      service_location: {
        type: DataTypes.ENUM,
        values: ['home', 'office'],
        defaultValue: 'office'
      },
      included_details: {
        type: DataTypes.JSON
      },
      intervalMinutes: {
        type: DataTypes.DECIMAL,
        allowNull: true
      },
      service_json: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'vendor_service'
    }
  )
  return vendor_service
}
