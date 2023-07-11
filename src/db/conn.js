const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("expresso", "guilhermerosa", "Uu232336364", {
  host: "localhost",
  dialect: "mysql",
});

try {
  console.log("Conectamos ao Mysql");
} catch (error) {
  console.log("Não conectou");
}

module.exports = sequelize;
