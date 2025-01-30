'use strict'
const { Model } = require('sequelize')
const vendor_service_coupon_code = require('./vendor_service_coupon_code')
module.exports = (sequelize, DataTypes) => {
  class booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      booking.belongsTo(models.Customer, {
        foreignKey: 'customer'
      })
      models.Customer.hasMany(models.booking, {
        foreignKey: 'customer'
      })

      booking.belongsTo(models.booking_coupon_code, {
        foreignKey: 'coupon_code'
      })

      models.booking_coupon_code.hasMany(models.booking, {
        foreignKey: 'coupon_code'
      })

      booking.belongsTo(models.booking_address, {
        foreignKey: 'address_id'
      })

      models.booking_address.hasMany(models.booking, {
        foreignKey: 'address_id'
      })

      booking.belongsTo(models.payment_details, {
        foreignKey: 'payment_id'
      })

      models.payment_details.hasMany(booking, {
        foreignKey: 'payment_id'
      })

      booking.belongsTo(models.refund_details, {
        foreignKey: 'refund'
      })

      models.refund_details.hasMany(booking, {
        foreignKey: 'refund'
      })
    }
  }
  booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      booking_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      tip: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        defaultValue: 0
      },
      customer: {
        type: DataTypes.UUID,
        references: {
          model: 'Customer',
          key: 'id'
        }
      },
      coupon_code: {
        type: DataTypes.UUID,
        references: {
          model: 'booking_coupon_code',
          key: 'id'
        }
      },
      refund: {
        type: DataTypes.UUID,
        references: {
          model: 'refund_details',
          key: 'id'
        }
      },
      address1: {
        type: DataTypes.TEXT
      },
      address12: {
        type: DataTypes.TEXT
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE
      },
      longitude: {
        type: DataTypes.DOUBLE
      },
      address_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'booking_address',
          key: 'id'
        }
      },
      payment_status: {
        type: DataTypes.ENUM('paid', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      convenience_fee: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM(
          'Upcoming',
          'Successful',
          'Cancelled',
          'Pending',
          'Reschedule',
          'Vendor_Cancel'
        ),
        allowNull: false,
        defaultValue: 'Pending'
      },
      cancel_reason: {
        type: DataTypes.TEXT
      },
      cancel_date: {
        type: DataTypes.DATE
      },
      payment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'payment_details',
          key: 'id'
        }
      },
      bill_json: {
        type: DataTypes.JSON,
        allowNull: true
      },
      cancel_stage: {
        type: DataTypes.ENUM('before_payment', 'after_payment'),
        allowNull: true
      },
      refund_status: {
        type: DataTypes.ENUM('Pending', 'Done'),
        allowNull: true
      },
      refund_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      vendor_cancel_stage: {
        type: DataTypes.ENUM('before_payment', 'after_payment'),
        allowNull: true
      },
      vendor_cancel_reason: {
        type: DataTypes.TEXT
      },
      vendor_cancel_date: {
        type: DataTypes.DATE
      },
      service_pending_reason: {
        type: DataTypes.STRING
      },
      service_pending_date: {
        type: DataTypes.DATE
      },
      reschedule_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      reschedule_status: {
        type: DataTypes.ENUM(['pending', 'approved', 'rejected']),
        allowNull: true
      },
      reschedule_reject_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      reschedule_reject_reason: {
        type: DataTypes.STRING,
        allowNull: true
      },
      admin_pay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      admin_pay_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'booking'
    }
  )
  return booking
}
