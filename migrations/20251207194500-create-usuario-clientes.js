'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UsuarioClientes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addIndex('UsuarioClientes', ['usuarioId', 'clienteId'], {
      name: 'uniq_usuario_cliente',
      unique: true
    });

    // migrate existing data
    await queryInterface.sequelize.query(`
      INSERT INTO "UsuarioClientes" ("usuarioId", "clienteId", "createdAt", "updatedAt")
      SELECT id, "clienteId", NOW(), NOW()
      FROM "Usuarios"
      WHERE "clienteId" IS NOT NULL
    `);

    await queryInterface.removeColumn('Usuarios', 'clienteId');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'clienteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'clientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.sequelize.query(`
      UPDATE "Usuarios" u
      SET "clienteId" = sub."clienteId"
      FROM (
        SELECT "usuarioId", MIN("clienteId") AS "clienteId"
        FROM "UsuarioClientes"
        WHERE "deletedAt" IS NULL
        GROUP BY "usuarioId"
      ) AS sub
      WHERE u.id = sub."usuarioId"
    `);
    await queryInterface.dropTable('UsuarioClientes');
  }
};
