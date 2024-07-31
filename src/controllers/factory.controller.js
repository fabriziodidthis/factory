// const { Sequelize } = require('sequelize')
// const { models, sequelize, Sequelize } = require('../database/models/index')
const models = require('../database/models/index')
const { sequelize } = require('../database/models')

const Joi = require('joi')

const { validatePhoneNumber } = require('../utils/isPhoneNumberValid')

/**
 * @description Função que adiciona uma nova confecção
 * @param {*} request Usa os dados do body enviados para criar uma nova confecção
 * @returns {Object} Retorna um objeto com a confecção criada
 */
const addNewFactory = async (request, response, next) => {
  const transaction = await sequelize.transaction()

  try {
    const factorySchema = Joi.object({
      factoryName: Joi.string().required(),
      address: Joi.string().required(),
      phoneNumber: Joi.number().integer().required().messages({
        'number.base': 'O número de telefone deve ser um número deve conter apenas números.',
        'number.integer': 'O número de telefone deve ser um número deve conter apenas números.',
        'number.required': 'O número de telefone é obrigatório.',
      }),
      isNumberWhatsapp: Joi.boolean().not().required(),
      observation: Joi.string().empty('').not(),
    })

    const { factoryName, address, phoneNumber, isNumberWhatsapp, observation } = request.body

    const phoneNumberAlreadyExists = await models.Factories.findOne({
      where: { phoneNumber },
      transaction,
    })

    if (phoneNumberAlreadyExists) {
      return response.status(400).json({
        message: 'Este número de telefone já está cadastrado.',
      })
    }

    const validateFactorySchema = await factorySchema.validateAsync({
      factoryName,
      address,
      phoneNumber,
      isNumberWhatsapp,
      observation,
    })

    const createNewFactory = await models.Factories.create(validateFactorySchema, { transaction })

    await transaction.commit()

    return response.status(201).json({
      message: 'Confecção criada com sucesso.',
      createNewFactory,
    })
  } catch (error) {
    await transaction.rollback()

    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que busca uma confecção pelo ID
 * @param {string} ID request Busca uma confecção pelo seu ID
 * @returns {Object} Retorna um objeto com a confecção encontrada
 */
const findFactoryByID = async (request, response, next) => {
  try {
    const { id } = request.params
    const factory = await models.Factories.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id válido.`,
      })
    }

    if (!factory) {
      return response.status(404).json({
        message: `Confecção com id ${id} não foi encontrada.`,
      })
    }

    return response.json({
      factory,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que busca todas as confecções
 * @param {*} request Busca todas as confecções cadastradas mas limitando os campos retornados
 * e contando quantas confecções cadastradas existem
 * @returns {Object} Retorna um objeto com todas as confecções encontradas
 */
const findAllFactories = async (request, response, next) => {
  try {
    const listAllFactories = await models.Factories.findAndCountAll({
      attributes: [
        'id',
        'factoryName',
        'address',
        'phoneNumber',
        'isNumberWhatsapp',
        'observation',
      ],
    })

    if (listAllFactories.count === 0) {
      return response.status(404).json({
        message: 'Não tem nenhuma confecção cadastrada.',
      })
    }

    return response.status(200).json({
      message: 'Listagem de todas as confecções',
      listAllFactories,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que atualiza uma confecção
 * @param {string} ID request Usa os dados do body enviados para atualizar uma confecção
 * @returns {Object} Retorna um objeto com os dados atualizados da confecção
 */
const updateOneFactory = async (request, response, next) => {
  try {
    const { id } = request.params
    const factory = await models.Factories.findByPk(id)
    const fieldsFromBody = request.body

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!factory) {
      return response.status(404).json({
        message: `Confecção com id ${id} não foi encontrada.`,
      })
    }

    validatePhoneNumber(fieldsFromBody.phoneNumber)

    if (
      !Boolean(
        fieldsFromBody?.isNumberWhatsapp && fieldsFromBody.isNumberWhatsapp !== typeof 'boolean',
      )
    ) {
      return response.status(400).json({
        message: "O valor para 'Número é Whatsapp?' deve ser apenas 'sim' ou 'não'.",
      })
    }

    const updateFactoryData = await models.Factories.update(
      { ...request.body },
      {
        where: {
          id,
        },
      },
    )

    return response.status(200).json({
      message: 'Dados da confecção foram atualizados',
      updateFactoryData,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função que deleta uma confecção
 * @param {string} ID request Deleta uma confecção pelo seu ID. Mas se tiver algum pedido em aberto
 * com esta confecção, não será possível deletar. Os pedidos ser~ao listados, caso existam.
 * @returns {Object} Retorna um objeto com a confecção deletada
 */
const deleteOneFactory = async (request, response, next) => {
  try {
    const { id } = request.params
    const findFactory = await models.Factories.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!findFactory) {
      return response.status(404).json({
        message: `Confecção com id ${id} não foi encontrada. Tem certeza que é o id correto?`,
      })
    }

    const existOrders = await models.Orders.findAndCountAll({
      where: Sequelize.and([{ factoryID: id, status: 'costurando' }]),
    })

    const findOrdersID = await models.Orders.findAll({
      where: Sequelize.and([{ factoryID: id, status: 'costurando' }]),
    })

    const listOrdersID = findOrdersID.map((item) => item.id).join(', ')

    if (existOrders) {
      return response.status(400).json({
        message: `Existe(m) ${existOrders.count} pedido(s) abertos com esta confecção. Finalize estes pedidos antes de deletar esta confecção. Os IDs do(s) pedido(s) são ${listOrdersID}`,
      })
    }

    const factoryToDelete = await models.Factories.destroy({
      where: { id },
    })

    return response.status(200).json({
      message: 'Confecção excluída com sucesso',
      factoryToDelete,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

module.exports = {
  addNewFactory,
  findFactoryByID,
  findAllFactories,
  updateOneFactory,
  deleteOneFactory,
}
