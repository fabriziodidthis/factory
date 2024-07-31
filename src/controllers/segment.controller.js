const models = require('../database/models/index')
const { sequelize } = require('../database/models')

/**
 * @description Função para adicionar um novo segmento
 * @param {string} segmentName - string -  nome do segmento
 * @param {number} price - number - preço do segmento
 * @throws {json} retorna uma mensagem de erro caso não seja informado todos os campos ou o segmento já exista
 * @returns {json} retorna um objeto com a mensagem de sucesso e o segmento criado
 */
const addNewSegment = async (request, response, next) => {
  try {
    const { segmentName, price } = request.body

    if (!segmentName || !price) {
      return response.status(400).json({
        message: 'Todos os campos devem ser preenchidos',
      })
    }

    if (isNaN(price)) {
      return response.status(400).json({
        message: 'Preço deve ser apenas números',
      })
    }

    if (price < 0) {
      return response.status(400).json({
        message: 'Preço não pode ser negativo',
      })
    }

    const segmentAlreadyExist = await models.Segments.findOne({ where: { segmentName } })

    if (segmentAlreadyExist) {
      return response.status(400).json({
        message: 'Segmento já existe',
      })
    }

    const createNewSegment = await models.Segments.create(request.body)

    return response.status(201).json({
      message: 'Segmento criado',
      createNewSegment,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função para encontrar um segmento pelo ID
 * @param {string} ID id do segmento a ser pesquisado
 * @throws {json} retorna uma mensagem de erro caso o id não seja informado ou não seja encontrado
 * @returns {json} retorna o segmento encontrado
 */
const findSegmentByID = async (request, response, next) => {
  try {
    const { id } = request.params
    const segment = await models.Segments.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!segment) {
      return response.status(404).json({
        message: `Segmento com id ${id} não foi encontrado.`,
      })
    }

    return response.json({
      segment,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função para encontrar e contar todos os segmentos cadastrados
 * @returns {json} retorna uma lista com todos os segmentos cadastrados
 */
const findAllSegments = async (request, response, next) => {
  try {
    const listAllSegments = await models.Segments.findAndCountAll()

    if (listAllSegments.count === 0) {
      return response.status(400).json({
        message: 'Nenhum segmento foi cadastrado ainda.',
      })
    }

    return response.status(200).json({
      message: 'Listagem de todos os segmentos',
      listAllSegments,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

/**
 * @description Função para atualizar um segmento
 * @param {string} ID id do segmento a ser atualizado
 * @throws {json} retorna uma mensagem de erro caso o id não seja informado ou não seja encontrado
 * @returns {json} retorna uma mensagem de sucesso e os dados do segmento atualizado
 */
const updateSegment = async (request, response, next) => {
  const t = await sequelize.transaction()
  const { segmentName, price } = request.body
  const { id } = request.params

  try {
    const segment = await models.Segments.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id válido.`,
      })
    }

    if (!segment) {
      return response.status(404).json({
        message: `Segmento com id ${id} não foi encontrado.`,
      })
    }

    await models.Segments.update(
      { segmentName, price },
      {
        where: { id },
        returning: true,
        transaction: t,
      },
    )

    const order = await models.Orders.findAll()

    const orderPrice =
      (await segment.price) *
      (order[0].dataValues.quantidadeDeSaida - order[0].dataValues.quantidadeDeRetorno)

    await models.Orders.update(
      { segmentName, orderPrice },
      {
        where: { segmentID: id },
        transaction: t,
      },
    )

    await t.commit()
    return response.status(200).json({
      message: 'Dados do segmento foram atualizados',
    })
  } catch (error) {
    await t.rollback()
    console.error(`Erro ao atualizar o segmento ${request.params.id}: ${error.message}`)
    next(error)
    return response.status(500).json({
      message: 'Alguma coisa deu erro',
      error: error.message,
    })
  }
}

const deleteSegment = async (request, response, next) => {
  try {
    const { id } = request.params
    const findSegment = await models.Segments.findByPk(id)

    if (!id || isNaN(id)) {
      return response.status(400).json({
        message: `É necessário informar um id.`,
      })
    }

    if (!findSegment) {
      return response.status(404).json({
        message: `Segmento com id '${id}' não foi encontrado. Tem certeza que é o id correto?`,
      })
    }

    const segmentToDelete = await models.Segments.destroy({
      where: { id },
    })

    return response.status(200).json({
      message: 'Segmento excluído com sucesso',
      segmentToDelete,
    })
  } catch (error) {
    next(error)
    return response.status(500).json({
      error: error.message,
    })
  }
}

module.exports = {
  addNewSegment,
  findSegmentByID,
  findAllSegments,
  updateSegment,
  deleteSegment,
}
