const { DataTypes } = require("sequelize");
const db = require("../db/conn.js");

const Cliente = db.define("Cliente", {
  nome: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assunto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  atendido: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Cliente;
