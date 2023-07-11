const Cliente = require("../models/chat");

async function updateStage(id, stage, date) {
  await Cliente.update({ stage: stage, date: date }, { where: { id: id } });
}
module.exports = updateStage;
