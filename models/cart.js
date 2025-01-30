'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      cart.belongsTo(models.Vendor, {
        foreignKey: 'vendor',
        as: 'cart_vendor'
      }),
        models.Vendor.hasMany(models.cart, {
          foreignKey: 'vendor',
          as: 'cart_vendor'
        })

      cart.belongsTo(models.vendor_service, {
        foreignKey: 'service'
      })

      models.vendor_service.hasMany(models.cart, {
        foreignKey: 'service'
      })

      cart.belongsTo(models.Customer, {
        foreignKey: 'customer',
        as: 'cart_customer'
      })

      models.Customer.hasMany(models.cart, {
        foreignKey: 'customer',
        as: 'cart_customer'
      })

      cart.belongsTo(models.booking, {
        foreignKey: 'booking_id'
      })

      models.booking.hasMany(models.cart, {
        foreignKey: 'booking_id'
      })

      cart.belongsTo(models.booking_address, {
        foreignKey: 'address'
      })

      models.booking_address.hasMany(cart, {
        foreignKey: 'address'
      })

      cart.belongsTo(models.calendar_booking_data, {
        foreignKey: 'calendar_id'
      })

      models.calendar_booking_data.hasMany(cart, {
        foreignKey: 'calendar_id'
      })
    }
  }
  cart.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      vendor: {
        type: DataTypes.UUID,
        references: {
          model: 'Vendor',
          key: 'id'
        }
      },
      customer: {
        type: DataTypes.UUID,
        references: {
          model: 'Customer',
          key: 'id'
        }
      },
      service: {
        type: DataTypes.UUID,
        references: {
          model: 'vendor_service',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT
      },
      time: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      },
      date: {
        type: DataTypes.DATE
      },
      price: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        allowNull: false
      },
       round_off_price: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        defaultValue: 0.0
      },
      orderId: {
        type: DataTypes.STRING
      },
      booking_time: {
        type: DataTypes.DATE
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      booking_id: {
        type: DataTypes.UUID,
        references: {
          model: 'booking',
          key: 'id'
        }
      },
      address: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'booking_address',
          key: 'id'
        }
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },

      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending'
      },

      rejected_reason: {
        type: DataTypes.TEXT
      },

      rejected_date: {
        type: DataTypes.DATE
      },
      calendar_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'calendar_booking_data',
          key: 'id'
        }
      },
      previous_reschedule_time: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      },
      previous_reschedule_date: {
        type: DataTypes.DATE
      },
      isMessageSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      location_status: {
        type: DataTypes.ENUM('pending', 'start', 'complete'),
        defaultValue: 'pending'
      },
      latitude: {
        type: DataTypes.STRING,
      },
      longitude: {
        type: DataTypes.STRING
      }
    },
    {
      sequelize,
      modelName: 'cart'
    }
  )
  return cart
}
