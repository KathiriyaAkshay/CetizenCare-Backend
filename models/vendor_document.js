'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vendor_Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vendor_Document.belongsTo(models.Vendor,{
        foreignKey:'vendor_id',
        targetKey: 'id',
        as: 'vendor'
      });

      models.Vendor.hasOne(models.Vendor_Document, {
  foreignKey: 'vendor_id',
  as: 'vendorDocument'
})

    }
  }
  Vendor_Document.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    dl_front: {
      type:DataTypes.BLOB('long'),
      allowNull: true,
    },
    dl_back: {
      type:DataTypes.BLOB('long'),
      allowNull: true,
    },
    ssn_img: {
      type:DataTypes.BLOB('long'),
      allowNull: true,
    },
    sli_img: {
      type:DataTypes.BLOB('long'),
      allowNull: true,
    },
    vendor_id:{
        type: DataTypes.UUID,
        references: {
          model: 'Vendors',
          key: 'id',
        },
      }
  }, {
    sequelize,
    modelName: 'Vendor_Document',
  });
  return Vendor_Document;
};