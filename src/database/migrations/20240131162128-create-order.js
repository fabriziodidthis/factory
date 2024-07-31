'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        unique: true,
      },
      factoryID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Factories',
          key: 'id',
        },
      },
      segmentID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Segments',
          key: 'id',
        },
      },
      segmentName: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Segments',
          key: 'segmentName',
        },
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM,
        values: ['costurando', 'costurado'],
        defaultValue: 'costurando',
        allowNull: true,
      },
      saidaParaCostura: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      quantidadeDeSaida: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          isNumeric: true,
          isInt: true,
          notNull: true,
          notEmpty: true,
        },
      },
      retiradaDaCostura: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      quantidadeDeRetorno: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          isNumeric: true,
          isInt: true,
          notNull: true,
          notEmpty: true,
        },
      },
      pecasFaltantes: {
        type: Sequelize.INTEGER,
        get() {
          const total =
            this.getDataValue('quantidadeDeSaida') - this.getDataValue('quantidadeDeRetorno')

          return total
        },
        defaultValue: 0,
      },
      orderPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      isDone: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders')
  },
}
