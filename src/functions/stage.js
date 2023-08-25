const Cliente = require("../models/chat");

async function atualizaStage(id, stage, date) {
  await Cliente.update({ stage: stage, date: date }, { where: { id: id } });
}
module.exports = atualizaStage;
