'use strict'
const { Model } = require('sequelize')
const Factories = require('./factory.models')
const models = require('./index')

module.exports = (sequelize, DataTypes) => {
  class Segment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Segment.hasMany(models.Orders, {
        foreignKey: 'segmentName',
        sourceKey: 'segmentName',
        as: 'orders',
      })
    }
  }
  Segment.init(
    {
      segmentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          isDecimal: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'Segments',
      tableName: 'Segments',
      indexes: [
        {
          unique: true,
          fields: ['segmentName'],
        },
      ],
    },
  )

  Segment.addHook('afterUpdate', async (segment, options) => {
    const { Orders } = sequelize.models

    // Fetch orders associated with the updated segment
    const orders = await models.Orders.findAll({
      where: { segmentName: models.Segment.segmentName },
    })

    // Perform the calculation and update each order
    for (const order of orders) {
      const orderPrice = segment.price * (order.quantidadeDeSaida - order.quantidadeDeRetorno)
      await order.update({ orderPrice })
    }
  })

  return Segment
}
