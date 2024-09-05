// index.js
const venom = require('venom-bot');
const cron = require('node-cron');
const conn = require("./db/conn");
const Cliente = require("./models/chat.js");
const updateStage = require("./functions/stage.js");
const dialogoinicio = require("./dialogs/dialogoinicio.js");
const dialogoencerra = require("./dialogs/dialogoencerra.js");
const dialogoatendente = require("./dialogs/dialogoatendente.js");

const moment = require("moment");
const dialogoloc = require('./dialogs/Dialogoloc.js');
const processedMessages = new Set();

async function startBot() {
  try {
    const client = await venom.create({ session: "Patrão Phone" });
    console.log("Bot iniciado!");

    client.onMessage(async (message) => {
      if (processedMessages.has(message.id.toString())) {
        console.log("Mensagem repetida. Ignorando...");
        return;
      }

      processedMessages.add(message.id.toString());

      if (message.from === "status@broadcast" || message.isGroupMsg) {
        console.log("Mensagem de lista de transmissão ou grupo. Ignorando...");
        return;
      }

      const startTime = moment().set({ hour: 1, minute: 10, second: 0 }); // Hora de início do expediente
      const endTime = moment().set({ hour: 18, minute: 0, second: 0 }); // Hora de fim do expediente

      if (!moment().isBetween(startTime, endTime)) {
        console.log("Mensagem recebida fora do horário permitido.");
        await client.sendText(message.from, "Estamos fora do nosso horário de expediente. Nosso horário de atendimento é das 08:00 às 18:00. Por favor, entre em contato durante esse horário.");
        return;
      }


      const tel = message.from.replace(/@c\.us/g, "");
      let cliente = await Cliente.findOne({ raw: true, where: { telefone: tel } });

      if (!cliente) {
        console.log("Novo atendimento criado");
        const dados = {
          nome: message.notifyName,
          telefone: tel,
          assunto: "contato Whatsapp",
          atendido: 1,
          stage: 1,
          date: message.timestamp,
        };
        const novoCliente = await Cliente.create(dados);
        dialogoinicio(client, message);
        updateStage(novoCliente.id, 2, message.timestamp);
      } else if (message.body && cliente.stage === 1) {
        dialogoinicio(client, message);
        updateStage(cliente.id, 2, message.timestamp);
      } else if (message.body === "1" && cliente.stage === 2) {
        dialogoatendente(client, message);
        updateStage(cliente.id, 170, message.timestamp);
      } else if (message.body === "2" && cliente.stage === 2) {
        dialogoatendente(client, message);
        updateStage(cliente.id, 170, message.timestamp);
      } else if (message.body === "3" && cliente.stage === 2) {
        dialogoloc(client, message);
        updateStage(cliente.id, 2, message.timestamp);
      } else if (message.body === "4" && cliente.stage === 2) {
        dialogoatendente(client, message);
        updateStage(cliente.id, 170, message.timestamp);
      } else if (message.body === "8" && cliente.stage === 2) {
        dialogoencerra(client, message);
        updateStage(cliente.id, 170, message.timestamp);
      }
    });

   // Agendamento para reiniciar o banco de dados a cada 3 horas
   cron.schedule('0 */3 * * *', async () => {
    try {
      await conn.sync({ force: true });
      console.log('Banco de dados reiniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao reiniciar o banco de dados:', error);
    }
  });

} catch (error) {
  console.error('Erro ao iniciar o bot:', error);
}
}

startBot();