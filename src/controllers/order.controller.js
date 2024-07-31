const models = require('../database/models/index')
const { Sequelize } = require('sequelize')
const { isValidDate } = require('../utils/isValidDate')

/**
 * @description Função que adiciona um novo pedido
 * @param {*} request Usa os dados do body enviados para criar um novo pedido, procurando se o segmento
 * informado existe, se a confecção informada existe e calculando o preço baseado na conta de quantidade
 * de saída e segmento informado
 * @returns {Object} Retorna um objeto com o pedido criado
 */
const addNewOrder = async (request, response, next) => {
  try {
    const fieldsFromBody = request.body

    if (
      !fieldsFromBody.segmentName ||
      !fieldsFromBody.factoryName ||
      !fieldsFromBody.saidaParaCostura ||
      !fieldsFromBody.quantidadeDeSaida ||
      !fieldsFromBody.retiradaDaCostura
    ) {
      return response.status(400).json({
        message: 'Todos os campos devem ser preenchidos',
      })
    }

    const findSegmentName = await models.Segments.findOne({
      where: { segmentName: fieldsFromBody.segmentName },
    })

    if (!findSegmentName) {
      return response.status(404).json({
        message: `O segmento ${fieldsFromBody.segmentName} não foi encontrado.`,
      })
    }

    const findSegmentIDbyName = async function (segmentName) {
      const findName = await models.Segments.findOne({
        where: { segmentName: fieldsFromBody.segmentName },
      })
      return findName.id
    }

    if (!findSegmentName || !findSegmentIDbyName) {
      return response.status(404).json({
        message: `O segmento ${fieldsFromBody.segmentName} não foi encontrado.`,
      })
    }

    const segmentID = await findSegmentIDbyName(fieldsFromBody.segmentName)

    const findFactoryIDByName = async function (factoryName) {
      const findName = await models.Factories.findOne({
        where: { factoryName: fieldsFromBody.factoryName },
      })
      return findName.id
    }

    const findFactoryName = await models.Factories.findOne({
      where: { factoryName: fieldsFromBody.factoryName },
    })

    if (!findFactoryName || !findFactoryIDByName) {
      return response.status(404).json({
        message: `A confecção ${fieldsFromBody.factoryName} não foi encontrada.`,
      })
    }

    const factoryID = await findFactoryIDByName(fieldsFromBody.factoryName)

    const findSegmentPrice = async function (segmentName) {
      const segment = await models.Segments.findOne({
        where: { segmentName: fieldsFromBody.segmentName },
      })
      return segment.dataValues.price
    }

    const calculateOrderPrice = async function (segmentName) {
      const calculateOrderPrice =
        (await findSegmentPrice(segmentName)) *
        (fieldsFromBody.quantidadeDeSaida - fieldsFromBody.quantidadeDeRetorno)

      return calculateOrderPrice
    }

    const orderPrice = await calculateOrderPrice(fieldsFromBody.segmentName)

    const orderData = {
      segmentID: segmentID,
      segmentName: fieldsFromBody.segmentName,
      factoryID: factoryID,
      factoryName: fieldsFromBody.factoryName,
      orderPrice: orderPrice,
      status: fieldsFromBody.status,
      saidaParaCostura: fieldsFromBody.saidaParaCostura,
      quantidadeDeSaida: fieldsFromBody.quantidadeDeSaida,
      retiradaDaCostura: fieldsFromBody.retiradaDaCostura,
      quantidadeDeRetorno: fieldsFromBody.quantidadeDeRetorno,
      pecasFaltantes: fieldsFromBody.quantidadeDeSaida - fieldsFromBody.quantidadeDeRetorno,
    }

    const createNewOrder = await models.Orders.create(orderData)

    return response.status(201).json({
      message: 'Pedido criado',
      createNewOrder,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que busca um pedido por status e segmento
 * @param {*} request Usa os dados do query enviado para buscar um pedido por status e segmento
 * @returns {Object} Retorna um objeto com o status e segmento informado
 */
const findPerStatus = async (request, response, next) => {
  try {
    const { status, segmento } = request.query

    if (!status || !segmento) {
      return response.status(400).json({
        message: 'Todos os campos devem ser preenchidos',
      })
    }

    const progress = Object.freeze({
      DONE: 'costurado',
      PENDING: 'costurando',
    })

    if (!Object.values(progress).includes(status)) {
      return response.status(400).json({
        message: `Status ${status} é inválido.`,
      })
    }

    const findSegmentName = await models.Segments.findOne({
      where: { segmentName: segmento },
      include: [{ model: models.Orders, as: 'orders' }],
    })
    // console.log('seg', findSegmentName)

    if (!findSegmentName) {
      return response.status(404).json({
        message: `O segmento ${segmento} não foi encontrado.`,
      })
    }

    const getOrderID = async () => {
      const order = await models.Orders.findOne()
      return order.id
    }

    if (!getOrderID) {
      return response.status(404).json({
        message: 'Não foi possível encontrar o ID do pedido informado.',
      })
    }

    const findAllOrdersPerStatusAndSegment = await models.Orders.findAndCountAll({
      where: { status, segmentName: segmento },
    })

    if (!findAllOrdersPerStatusAndSegment) {
      return response.json({
        message: `Não existem pedidos com o status ${status} e segmento  cadastrado.`,
      })
    }

    const data = {
      ...findAllOrdersPerStatusAndSegment,
    }

    return response.json({
      status,
      segmento,
      data,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que busca e conta todos os pedidos cadastrados
 * @returns {Object} Retorna um objeto com todos os pedidos cadastrados
 */
const findAllOrders = async (request, response, next) => {
  try {
    const findAll = await models.Orders.findAndCountAll({
      order: [['id', 'DESC']],
      // limit: 2,
      // offset: 2,
    })

    if (findAll.count === 0) {
      return response.status(404).json({
        message: 'Nenhum pedido cadastrado.',
      })
    }

    return response.status(200).json({
      message: 'Listagem de todos os pedidos',
      findAll,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que busca e conta todos os pedidos pendentes, ordenando por ordem decrescente
 * @returns {Object} Retorna um objeto com todos os pedidos com o status 'pendente'
 */
const findAllPendingOrders = async (request, response, next) => {
  try {
    const findAll = await models.Orders.findAndCountAll({
      order: [['id', 'DESC']],
      where: { status: 'costurando' },
    })

    if (!findAll) {
      return response.status(404).json({
        message: 'Não foi encontrado nenhum pedido pendente.',
      })
    }

    return response.status(200).json({
      message: 'Listagem de todos os pedidos pendentes',
      findAll,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que atualiza um pedido com os dados informados no body para atualizar um pedido,
 * verificando se o id informado existe, se o segmento informado existe, se a confecção informada existe
 * e calculando o preço baseado na conta de quantidade de saída e segmento informado
 * @param {string} ID ID da confecção a ser atualizada
 * @returns {Object} Retorna um objeto com o pedido atualizado
 */
const updateOrder = async (request, response, next) => {
  try {
    const { id } = request.params
    const fieldsFromBody = request.body

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    const order = await models.Orders.findByPk(id)
    if (!order) {
      return response.status(404).json({
        message: `Pedido com id '${id}' não foi encontrado.`,
      })
    }

    const findSegmentNameFromOrderID = order.dataValues.segmentName
    const findSegmentIDFromOrderID = order.dataValues.segmentID
    const findFactoryNameFromOrderID = order.dataValues.factoryName
    const findFactoryIDFromOrderID = order.dataValues.factoryID
    const findStatusFromOrderID = order.dataValues.status
    const findOrderPriceFromOrderID = order.dataValues.orderPrice
    const findQuantidadeDeSaidaFromOrderID = order.dataValues.quantidadeDeSaida
    const findQuantidadeDeRetornoFromOrderID = order.dataValues.quantidadeDeRetorno
    const findSaidaParaCosturaFromOrderID = order.dataValues.saidaParaCostura
    const findRetiradaDaCosturaFromOrderID = order.dataValues.retiradaDaCostura
    const findIsDoneFromOrderID = order.dataValues.isDone

    const validate_quantidadeDeSaida = Boolean(
      (fieldsFromBody.quantidadeDeSaida && isNaN(fieldsFromBody.quantidadeDeSaida)) ||
        fieldsFromBody.quantidadeDeSaida < 0,
    )

    const validate_quantidadeDeRetorno = Boolean(
      (fieldsFromBody.quantidadeDeRetorno && isNaN(fieldsFromBody.quantidadeDeRetorno)) ||
        fieldsFromBody.quantidadeDeRetorno < 0,
    )

    if (validate_quantidadeDeSaida) {
      return response.status(400).json({
        message: `O valor '${fieldsFromBody.quantidadeDeSaida}' informado para quantidade de saída deve ser um número positivo e maior que 0.`,
      })
    }
    if (validate_quantidadeDeRetorno < 0) {
      return response.status(400).json({
        message: `O valor '${fieldsFromBody.quantidadeDeRetorno}' informado para quantidade de retorno deve ser um número positivo e maior que 0.`,
      })
    }

    if (!findSegmentNameFromOrderID) {
      return response.status(404).json({
        message: `O segmento '${findSegmentNameFromOrderID}' não foi encontrado.`,
      })
    }
    if (!findSegmentIDFromOrderID) {
      return response.status(404).json({
        message: `O id ${findSegmentIDFromOrderID} do segmento '${findSegmentNameFromOrderID}' não foi encontrado.`,
      })
    }
    if (!findFactoryNameFromOrderID) {
      return response.status(404).json({
        message: `A confecção '${findFactoryNameFromOrderID}' não foi encontrada.`,
      })
    }
    if (!findFactoryIDFromOrderID) {
      return response.status(404).json({
        message: `O id ${findFactoryIDFromOrderID} da confecção '${findFactoryNameFromOrderID}' não foi encontrado.`,
      })
    }
    if (!findStatusFromOrderID) {
      return response.status(404).json({
        message: `O status '${findStatusFromOrderID}' não foi encontrado.`,
      })
    }

    const progress = Object.freeze({
      DONE: 'costurado',
      PENDING: 'costurando',
    })

    if (!Object.values(progress).includes(findStatusFromOrderID)) {
      return response.status(400).json({
        message: 'Status inválido',
      })
    }

    if (fieldsFromBody.saidaParaCostura && !isValidDate(fieldsFromBody.saidaParaCostura)) {
      return response.status(400).json({
        message: `O valor de saída para costura deve ser uma data.`,
      })
    }

    if (fieldsFromBody.retiradaDaCostura && !isValidDate(fieldsFromBody.retiradaDaCostura)) {
      return response.status(400).json({
        message: `O valor para retirada da costura deve ser uma data.`,
      })
    }

    if (fieldsFromBody.isDone && typeof fieldsFromBody.isDone !== 'boolean') {
      return response.status(400).json({
        message: "O valor para 'Está pronto?' deve ser apenas 'sim' ou 'não'.",
      })
    }

    const findSegmentPrice = async function (segmentName) {
      const findSegmentName = await models.Segments.findOne({
        where: { segmentName: segmentName },
      })
      if (!findSegmentName) {
        return response.status(404).json({
          message: `O segmento '${segmentName}' não foi encontrado.`,
        })
      }
      return findSegmentName.price
    }

    // ### VALIDAÇÕES PARA ATUALIZAÇÃO DE PREÇOS BASEADO NO BODY ###

    const has_quantidadeDeSaida =
      fieldsFromBody.quantidadeDeSaida && !fieldsFromBody.quantidadeDeRetorno
    const has_quantidadeDeRetorno =
      fieldsFromBody.quantidadeDeRetorno && !fieldsFromBody.quantidadeDeSaida
    const has_saidaEretorno = fieldsFromBody.quantidadeDeSaida && fieldsFromBody.quantidadeDeRetorno

    /**
     * @description Se os campos 'quantidadeDeSaida' e 'quantidadeDeRetorno' forem informados,
     * o preço do pedido será atualizado de acordo com a quantidade de saída e retorno informada.
     */
    if (has_saidaEretorno) {
      const segmentPrice = await findSegmentPrice(findSegmentNameFromOrderID)

      Number(
        (fieldsFromBody.orderPrice =
          segmentPrice * (fieldsFromBody.quantidadeDeSaida - fieldsFromBody.quantidadeDeRetorno)),
      ).toFixed(2)
    }

    /**
     * @description Se APENAS o campo 'quantidadeDeSaida' for informado, o preço do pedido será atualizado
     * de acordo com a quantidade de saída já existente no pedido.
     */

    if (has_quantidadeDeSaida) {
      const segmentPrice = await findSegmentPrice(findSegmentNameFromOrderID)
      Number(
        (fieldsFromBody.orderPrice =
          segmentPrice * (fieldsFromBody.quantidadeDeSaida - order.quantidadeDeRetorno)),
      ).toFixed(2)
    }

    /**
     * @description Se APENAS o campo 'quantidadeDeRetorno' for informado, o preço do pedido será atualizado
     * de acordo com a quantidade de retorno informada.
     */

    if (has_quantidadeDeRetorno) {
      const segmentPrice = await findSegmentPrice(findSegmentNameFromOrderID)

      Number(
        (fieldsFromBody.orderPrice =
          segmentPrice * (findQuantidadeDeSaidaFromOrderID - fieldsFromBody.quantidadeDeRetorno)),
      ).toFixed(2)
    }

    const data = {
      orderPrice: fieldsFromBody?.orderPrice || order.orderPrice,
      status: fieldsFromBody?.status || findStatusFromOrderID,
      quantidadeDeSaida: fieldsFromBody?.quantidadeDeSaida || findQuantidadeDeSaidaFromOrderID,
      quantidadeDeRetorno:
        fieldsFromBody?.quantidadeDeRetorno || findQuantidadeDeRetornoFromOrderID,
      retiradaDaCostura: fieldsFromBody?.retiradaDaCostura || findRetiradaDaCosturaFromOrderID,
      saidaParaCostura: fieldsFromBody?.saidaParaCostura || findSaidaParaCosturaFromOrderID,
      isDone: fieldsFromBody?.isDone || findIsDoneFromOrderID,
      pecasFaltantes:
        (fieldsFromBody?.quantidadeDeSaida || findQuantidadeDeSaidaFromOrderID) -
        (fieldsFromBody?.quantidadeDeRetorno || findQuantidadeDeRetornoFromOrderID),
    }

    const updateOrder = await models.Orders.update(data, {
      where: {
        id,
      },
    })

    return response.status(200).json({
      message: 'Dados do pedido foram atualizados',
      data,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      message: 'Alguma coisa deu erro',
      errorMessage: error.message,
    })
  }
}

/**
 * @description Pesquisa um pedido por ID
 * @param {string} ID ID do pedido a ser pesquisado
 * @returns {Object} Retorna um objeto com o pedido encontrado
 * @throws {Error} Se o ID não for informado, retorna um erro
 */
const findOrderByID = async (request, response, next) => {
  try {
    const { id } = request.params
    const order = await models.Orders.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!order) {
      return response.status(404).json({
        message: `Pedido com id ${id} não foi encontrado.`,
      })
    }

    return response.json({
      message: `Listagem de ordem(ns) do ID ${id}`,
      order,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Deleta um pedido por ID
 * @param {string} ID ID do pedido a ser deletado
 * @returns {Object} Retorna um objeto com o pedido deletado
 * @throws {Error} Se o ID não for informado, retorna um erro
 */
const deleteOrderByID = async (request, response, next) => {
  try {
    const { id } = request.params
    const order = await models.Orders.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!order) {
      return response.status(404).json({
        message: `Não foi possível encontrar o pedido com id '${id}' informado. Confira o ID e tente novamente.`,
      })
    }

    const deleteOrder = await models.Orders.destroy({
      where: { id },
    })

    return response.status(200).json({
      message: `Pedido de id '${id}'  excluído com sucesso`,
      deleteOrder,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      message: `Servidor retornou erro:`,
      error: error.message,
    })
  }
}

module.exports = {
  addNewOrder,
  findPerStatus,
  findAllOrders,
  findAllPendingOrders,
  updateOrder,
  findOrderByID,
  deleteOrderByID,
}
