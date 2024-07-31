'use strict'
const { Model } = require('sequelize')
const Segments = require('./segment.models.js')
module.exports = (sequelize, DataTypes) => {
  class Factory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Factory.init(
    {
      factoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isNumberWhatsapp: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      observation: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Factories',
      tableName: 'Factories',
    },
  )

  return Factory
}
