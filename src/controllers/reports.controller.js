const models = require('../database/models/index')
const { Sequelize } = require('sequelize')
const { gt } = Sequelize.Op

/**
 * @description Pesquisa por todas as ordens que estão finalizadas e retorna o total de preço
 * de todas as ordens finalizadas, e retorna todas as ordens que ainda não foram finalizadas e
 * que possuem peças faltantes.
 * @returns retorna o total de preço de todas as ordens finalizadas e retorna todas as ordens que
 * ainda não foram finalizadas e que possuem peças faltantes.
 */
const findDone = async (request, response, next) => {
  try {
    const ordersDoneTotalPrice = await models.Orders.sum('orderPrice', {
      where: { isDone: true },
    })

    const finishedOrders = await models.Orders.findAll({
      where: { isDone: true },
    })

    const ordersWith_pecasFaltantes = await models.Orders.findAndCountAll({
      where: Sequelize.and([
        {
          pecasFaltantes: {
            [gt]: 1,
          },
          isDone: false,
        },
      ]),
    })

    if (!ordersDoneTotalPrice || !finishedOrders) {
      return response.status(400).json({
        message:
          'Não foi encontrado ao menos um pedido finalizado para poder continuar a operação. Se acha que isto seja um erro, entre em contato com o suporte.',
      })
    }

    if (!ordersWith_pecasFaltantes.count === 0) {
      return response.status(400).json({
        message:
          'Não foi possível achar algum pedido com peças faltantes para poder continuar a operação. Se acha que isto seja um erro, entre em contato com o suporte.',
      })
    }

    return response.status(200).json({
      ordersDoneTotalPrice: {
        ordersDoneTotalPrice,
        finishedOrders,
      },
      ordersWith_pecasFaltantes,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      message: 'Alguma coisa deu erro',
      errorMessage: error.message,
      errorStack: error.stack,
      errorStatus: error.status,
    })
  }
}

module.exports = {
  findDone,
}
