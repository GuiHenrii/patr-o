// Funcionais
const Connect = require("@wppconnect-team/wppconnect");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const { Console } = require("console");
const schedule = require("node-schedule");
const conn = require("./db/conn");
const Sequelize = require("sequelize");

// Dialogos
const dialogoinicio = require("./dialogs/dialogoinicio.js");
const dialogoNome = require("./dialogs/dialogoNome.js");
const dialogoTel = require("./dialogs/dialogoTel.js");
const dialogoDestino = require("./dialogs/dialogoDestino.js");
const dialogoOrigem = require("./dialogs/dialogoOrigem.js");
const dialogoSaida = require("./dialogs/dialogoSaida.js");
const dialogoRetorno = require("./dialogs/dialogoRetorno.js");
const dialogo2 = require("./dialogs/dialogo2.js");
const dialogoValor = require("./dialogs/dialogoValor.js");
const dialogoPassagem = require("./dialogs/dialogoPassagem.js");
const dialogocomprar = require("./dialogs/dialogocomprar.js");
const dialogoatendente = require("./dialogs/dialogoatendente.js");
const dialogoencerra = require("./dialogs/dialogoencerra.js");
const dialogoError = require("./dialogs/dialogoError.js");
const dialogoLink = require("./dialogs/dialogoLink.js");
const dialogoPasseio = require("./dialogs/dialogoPasseio.js");
const dialogoreiniciar = require("./dialogs/dialogoreiniciar.js");

//functions
const atualizaStage = require("./functions/stage.js");

// Models
const Cliente = require("./models/chat.js");

const date = new Date();

const contatos = JSON.parse(fs.readFileSync("contatos.json", "utf8"));

async function reiniciarAtendimento(id, client, message) {
  const stage = 1;
  // Atualiza estado do cliente
  await Cliente.update({ stage }, { where: { id: id } });
  dialogoreiniciar(client, message);
}

function salvaContato(tempObj) {
  console.log("Início da função salvaContato");
  console.log("Objeto recebido:", tempObj);
  dialogoreiniciar(client, mess);
}
function start(client) {
  console.log("Cliente iniciado e conectado!");
  // Inicio atendimento
  const atendimento = {};

  client.onMessage(async (message) => {
    if (message.from === "status@broadcast") {
      console.log("contato lista de transmissão");
      return;
    }
    const messageDate = new Date(message.timestamp * 1000);
    const data = new Date();
    const dataFormat = moment(data).format("YYYY-MM-DD");
    const datamessageFormat = moment(messageDate).format("YYYY-MM-DD");
    if (dataFormat === datamessageFormat && message.isGroupMsg === false) {
      // Se não é de grupo(false) executa o codigo e compara a data

      // Pesquisa e deixa o cliente pronto para os update
      const tel = message.from.replace(/@c\.us/g, "");
      const cliente = await Cliente.findOne({
        raw: true,
        where: { telefone: tel },
      });
      console.dir(cliente);

      // Entra nesse if caso o cliente não exista no banco de dados
      if (!cliente) {
        console.log("Novo atendimento criado");
        const dados = {
          nome: message.notifyName,
          telefone: tel,
          assunto: "contato Whatsapp",
          atendido: 1,
          stage: 1,
          date: message.timestamp, //Verificar se ele trás a hora
        };
        const cliente = await Cliente.create(dados);
        dialogoinicio(client, message);
        const id = cliente.id;
        const dialogo = "dialogoinicio";
        const stage = 2;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }
      //  ---------- Inicio da conversa
      else if (message.body && cliente.stage === 1) {
        dialogoinicio(client, message);
        const id = cliente.id;
        const dialogo = "dialogoinicio";
        const stage = 2;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }
      //  -------------------- Envia o os horarios de onibus
      else if (message.body === "1" && cliente.stage === 2) {
        client
          .sendImage(
            message.from,
            "./imagens/hora.png",
            "image-name",
            "Digite *'Ok'* para voltar ao menu inicial"
          )
          .then((result) => {
            console.log("Result: ", result); //return object success
          })
          .catch((erro) => {
            console.error("Error when sending: ", erro); //return object error
          });
      }
      //  -------------------- Envia os Valores
      else if (message.body === "2" && cliente.stage === 2) {
        client
          .sendImage(
            message.from,
            "./imagens/valor.png",
            "image-name",
            "Digite *'OK'* para voltar ao menu inicial"
          )
          .then((result) => {
            console.log("Result: ", result); //return object success
          })
          .catch((erro) => {
            console.error("Error when sending: ", erro); //return object error
          });
      }
      //  -------------------- Faz a pergunta da data
      else if (message.body === "3" && cliente.stage === 2) {
        dialogoLink(client, message);
        const id = cliente.id;
        const dialogo = "dialogolink";
        const stage = 2;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }
      //aluguel de onibus
      else if (message.body === "4" && cliente.stage === 2) {
        atendimento.cliente = message.body;
        dialogoatendente(client, message);
        const id = cliente.id;
        const dialogo = "dialogoatendente";
        const stage = 170;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 170) {
        const id = cliente.id;
        const dialogo = "";
        const stage = 170;
        const date = message.timestamp;
      }
      //  -------------------- Faz abertura para pacote de viagens
      else if (message.body === "5" && cliente.stage === 2) {
        atendimento.cliente = message.body;
        dialogoNome(client, message);
        const id = cliente.id;
        const dialogo = "dialogoNome";
        const stage = 10;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 10) {
        dialogoTel(client, message);
        const id = cliente.id;
        const dialogo = "dialogoTel";
        const stage = 4;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 4) {
        dialogoSaida(client, message);
        const id = cliente.id;
        const dialogo = "dialogoSaida";
        const stage = 5;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 5) {
        dialogoRetorno(client, message);
        const id = cliente.id;
        const dialogo = "dialogoRetorno";
        const stage = 6;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }
      //
      else if (message.body && cliente.stage === 6) {
        dialogoOrigem(client, message);
        const id = cliente.id;
        const dialogo = "dialogoOrigem";
        const stage = 7;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 7) {
        dialogoDestino(client, message);
        const id = cliente.id;
        const dialogo = "dialogoDestino";
        const stage = 15;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 15) {
        dialogoatendente(client, message);
        const id = cliente.id;
        const dialogo = "dialogoatendente";
        const stage = 20;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 20) {
        const id = cliente.id;
        const dialogo = "";
        const stage = 170;
        const date = message.timestamp;
      }
      // ---------- manda pro suporte
      else if (message.body === "6" && cliente.stage === 2) {
        atendimento.end = message.body;
        dialogoatendente(client, message);
        const id = cliente.id;
        const dialogo = "dialogoatendente";
        const stage = 17;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
        //manda pro administrativo
      } else if (message.body && cliente.stage === 17) {
        const id = cliente.id;
        const dialogo = "";
        const stage = 170;
        const date = message.timestamp;
      } else if (message.body === "7" && cliente.stage === 2) {
        atendimento.end = message.body;
        dialogoatendente(client, message);
        const id = cliente.id;
        const dialogo = "dialogoatendente";
        const stage = 18;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      } else if (message.body && cliente.stage === 18) {
        const id = cliente.id;
        const dialogo = "";
        const stage = 170;
        const date = message.timestamp;
      } else if (message.body === "8" && cliente.stage === 2) {
        atendimento.end = message.body;
        dialogoencerra(client, message);
        const id = cliente.id;
        const dialogo = "dialogoencerra";
        const stage = 1;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }

      // ---------------- joga o link pra comprar passagem-----------------
      else if (message.body === "1" && cliente.stage === 4) {
        // atendimento[tel].passagem = message.body;
        const textomensagem =
          "Acesse o link para efetuar a compra da sua passagem:\nhttps://www.buson.com.br/viacao/expresso-de-luxo-mg";
        client
          .sendText(message.from, textomensagem)
          .then(() => {
            console.log("Messagem.");
          })
          .catch((error) => {
            console.error("Error when sending message", error);
          });
        const id = cliente.id;
        const dialogo = "";
        const stage = 3;
        const date = message.timestamp;
        atualizaStage(id, stage, date);
      }
      // --------------------- Final do ajuste ---------------
      // Caso algo de errado
      else {
        const id = cliente.id;
        const dialogo = "";
        const stage = 1;
        const date = message.timestamp;
        atualizaStage(id, stage, date);

        const texto =
          "Vamos reiniciar o seu atendimento, Por favor digite 'OK'";
        client
          .sendText(message.from, texto)
          .then(() => {
            console.log("Mensagem enviada.");
          })
          .catch((error) => {
            console.error("Erro ao enviar mensagem", error);
          });
      }
    }
  });
}

Connect
  .create({
    session: "Expresso", //name of session
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function salvaContato(tempObj) {
  console.log("Início da função salvaContatos");
  console.log("Objeto recebido:", tempObj);

  fs.readFile("atendimentos.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo atendimentos.json", err);
      return;
    }
    console.log("Arquivo atendimentos.json lido com sucesso");
    const atendimentos = JSON.parse(data);
    //nova função para atualizar stage no atendimento
    atendimentos.push(tempObj);

    const json = JSON.stringify(atendimentos, null, 2);
    fs.writeFile("atendimentos.json", json, "utf8", (err) => {
      if (err) {
        console.error("Erro ao escrever o arquivo atendimentos.json", err);
        return;
      }
      console.log("Arquivo atendimentos.json salvo com sucesso");
    });
  });
}
conn
  .sync()
  .then(() => {})
  .catch((err) => console.log(err));
