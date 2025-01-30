'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class refund_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate (models) {
      // define association here
    }
  }
  refund_details.init(
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
      refund_id: {
        type: DataTypes.STRING
      },
      transaction_id: {
        type: DataTypes.STRING
      },
      charge_id: {
        type: DataTypes.STRING
      },
      payment_intent_id: {
        type: DataTypes.STRING
      },
      receipt_url: {
        type: DataTypes.TEXT
      },
      amount: {
        type: DataTypes.DECIMAL(19, 5).UNSIGNED,
        allowNull: false,
        default: 0.0
      },
      destination_details: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'refund_details'
    }
  )
  return refund_details
}
