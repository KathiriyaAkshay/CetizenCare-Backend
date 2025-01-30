'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class payment_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate (models) {
      // define association here
    //   payment_details.belongsTo(models.booking, {
    //     foreignKey: 'booking_id'
    //   })

    //   models.booking.hasMany(payment_details, {
    //     foreignKey: 'booking_id'
    //   })
    }
  }
  payment_details.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      booking_id: {
        type: DataTypes.UUID,
        references: {
          model: 'booking',
          key: 'id'
        }
      },
      checkout_session: {
        type: DataTypes.STRING,
      },
      time: {
        type: DataTypes.STRING
      },
      amount: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        allowNull: false,
        default: 0.0
      },
      status: {
        type: DataTypes.ENUM('successful', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      method: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'card'
      },
      trasaction_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      payment_intent_id: {
        type: DataTypes.STRING
      },

      payment_intent_created_at: {
        type: DataTypes.STRING
      },

      payment_intent_amount: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED
      },

      payment_intent_status: {
        type: DataTypes.ENUM('success', 'failed', 'neutral'),
        defaultValue: 'neutral'
      },
      refund_status: {
        type: DataTypes.ENUM('pending', 'done'),
        allowNull: true,
      },
      refund_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      receipt_url: {
        type: DataTypes.TEXT
      }
    },
    {
      sequelize,
      modelName: 'payment_details'
    }
  )
  return payment_details
}
