// index.js
const Connect = require("@wppconnect-team/wppconnect");
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

const inactiveDuration = 30 * 60 * 1000; // 30 minutos em milissegundos
const userActivity = new Map();

const restrictedNumbers = [
  "556281081584",
  "556282885001",
  "556291877310"
];

let botInstance;

process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
  restartBot();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em Promise:', promise, 'Razão:', reason);
  restartBot();
});

async function startBot() {
  try {
    const client = await Connect.create({ session: "Patrão Phone" });
    botInstance = client;
    console.log("Bot iniciado!");

    client.onMessage(async (message) => {
      try {
        logMessageTime(message);
        updateUserActivity(message.from);

        const formattedNumber = message.from.replace(/@c\.us/g, "");

        if (restrictedNumbers.includes(formattedNumber)) {
          console.log(`Mensagem de número restrito (${formattedNumber}). Ignorando...`);
          return;
        }

        if (processedMessages.has(message.id.toString())) {
          console.log("Mensagem repetida. Ignorando...");
          return;
        }

        processedMessages.add(message.id.toString());

        if (message.from === "status@broadcast" || message.isGroupMsg) {
          console.log("Mensagem de grupo ou lista. Ignorando...");
          return;
        }

        const startTime = moment().set({ hour: 8, minute: 30, second: 0 });
        const endTime = moment().set({ hour: 18, minute: 30, second: 0 });

        if (!moment().isBetween(startTime, endTime)) {
          console.log("Mensagem fora do horário de atendimento.");
          return;
        }

        const tel = formattedNumber;
        let cliente = await Cliente.findOne({ raw: true, where: { telefone: tel + '@c.us' } }); // Adicionando @c.us na busca

        if (!cliente) {
          console.log("Novo atendimento criado");
          const dados = {
            nome: message.notifyName,
            telefone: tel + '@c.us', // Adicionando @c.us ao número
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
        } else {
          handleDialogs(client, message, cliente);
        }
      } catch (error) {
        console.error('Erro ao processar a mensagem:', error);
      }
    });

    // Verifica inatividade a cada 1 minuto
    setInterval(async () => {
      const now = Date.now();
      for (const [number, lastActivity] of userActivity) {
        if (now - lastActivity > inactiveDuration) {
          console.log(`Encerrando atendimento para o número ${number} devido à falta de interação.`);
          await handleInactiveUser(client, number);
        }
      }
    }, 60000); // 1 minuto

  } catch (error) {
    console.error('Erro ao iniciar o bot:', error);
    restartBot(); // Reinicia se houver erro
  }
}

function updateUserActivity(number) {
  console.log(`Atualizando atividade do usuário: ${number}`);
  userActivity.set(number, Date.now());
}

async function handleInactiveUser(client, number) {
  try {
    console.log(`Tratando inatividade para o número: ${number}`);
    
    // Adiciona @c.us ao número para fazer a busca
    const fullNumber = number.includes('@c.us') ? number : number + '@c.us';
    
    const deletedRows = await Cliente.destroy({ where: { telefone: fullNumber } });
    
    console.log(`Tentativa de remover atendimento para ${fullNumber}. Linhas deletadas: ${deletedRows}`);
    
    if (deletedRows > 0) {
      console.log(`Atendimento para ${fullNumber} removido do banco de dados.`);
      const message = `Devido a falta de interação, estou encerrando nosso atendimento.`;
      await client.sendText(fullNumber, message);
    } else {
      console.log(`Nenhum atendimento encontrado para ${fullNumber}.`);
    }

    userActivity.delete(number);
  } catch (error) {
    console.error(`Erro ao tratar inatividade do usuário ${number}:`, error);
  }
}


function handleDialogs(client, message, cliente) {
  if (message.body === "1" && cliente.stage === 2) {
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
}

function logMessageTime(message) {
  const messageTime = moment.unix(message.timestamp).format('DD-MM-YYYY HH:mm:ss');
  console.log(`Mensagem recebida às: ${messageTime}\n${message.notifyName}\n`);
}

async function restartBot() {
  try {
    console.log("Reiniciando bot...");

    if (botInstance) {
      await botInstance.close();
      console.log("Instância do cliente fechada.");
    }

    setTimeout(() => {
      console.log("Reiniciando a aplicação...");
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error("Erro ao reiniciar o bot:", error);
  }
}

conn
  .sync()
  .then(() => console.log('Conexão com o banco de dados estabelecida.'))
  .catch((err) => console.log('Erro ao conectar ao banco de dados:', err));

startBot();
