const venom = require("venom-bot");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
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
const { Console } = require("console");

const date = new Date();
const horario = fs.readFileSync("./imagens/horario.PNG");

function start(client) {
  console.log("Cliente Venom iniciado!");

  // Inicio atendimento
  const atendimento = {};
  // função para salvar os dados
  function salvaContato(tempObj) {
    console.log("Início da função salvaContato");
    console.log("Objeto recebido:", tempObj);

    fs.readFile("atendimentos.json", "utf8", (err, data) => {
      if (err) {
        console.error("Erro ao ler o arquivo atendimentos.json", err);
        return;
      }
      console.log("Arquivo atendimentos.json lido com sucesso");
      const atendimentos = JSON.parse(data);

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

  client.onMessage((message) => {
    console.log(message);
    const messageDate = new Date(message.timestamp * 1000);
    console.log(messageDate);
    const data = new Date();
    console.log(data);
    const dataFormat = moment(data).format("YYYY-MM-DD");
    const datamessageFormat = moment(messageDate).format("YYYY-MM-DD");
    console.log(datamessageFormat);
    console.log(dataFormat);

    // Se não é de grupo(false) executa o codigo e compara a data
    if (dataFormat === datamessageFormat && message.isGroupMsg === false) {
      // Monta a constante para o objeto
      const tel = message.from;

      if (!atendimento[tel]) {
        console.log("Creating new atendimento entry");

        let stage = 1;

        atendimento[tel] = {
          tel: tel,
          cliente: null,
          passagem: null,
          dataida: null,
          comprar: null,
          destino: null,
          stage: stage, // Define em qual Else if o cliente esta. Controla a msg
        };
        console.log("New atendimento entry created:", atendimento[tel]);
      }
      console.log(message);
      //  ---------- Inicio da conversa
      if (message.body && atendimento[tel].stage === 1) {
        dialogoinicio(client, message);
        atendimento[tel].stage = 2;
      }
      //  -------------------- Envia o os horarios de onibus
      else if (message.body === "1" && atendimento[tel].stage === 2) {
        client
          .sendImage(
            message.from,
            "./imagens/horario.png",
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
      else if (message.body === "2" && atendimento[tel].stage === 2) {
        client
          .sendImage(
            message.from,
            "./imagens/valor.png",
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
      //  -------------------- Faz a pergunta da data
      else if (message.body === "3" && atendimento[tel].stage === 2) {
        dialogoLink(client, message);
        atendimento[tel].stage = 1;
      }
      //aluguel de onibus
      else if (message.body === "4" && atendimento[tel].stage === 2) {
        atendimento.cliente = message.body;
        dialogoatendente(client, message);
        atendimento[tel].stage = 170;
      } else if (message.body && atendimento[tel].stage === 170) {
        atendimento[tel].stage = 170;
      }
      //  -------------------- Faz abertura para pacote de viagens
      else if (message.body === "5" && atendimento[tel].stage === 2) {
        atendimento.cliente = message.body;
        dialogoNome(client, message);
        atendimento[tel].stage = 10;
      } else if (message.body && atendimento[tel].stage === 10) {
        dialogoTel(client, message);
        atendimento[tel].stage = 4;
      } else if (message.body && atendimento[tel].stage === 4) {
        dialogoSaida(client, message);
        atendimento[tel].stage = 5;
      } else if (message.body && atendimento[tel].stage === 5) {
        dialogoRetorno(client, message);
        atendimento[tel].stage = 6;
      }
      //
      else if (message.body && atendimento[tel].stage === 6) {
        dialogoOrigem(client, message);
        atendimento[tel].stage = 7;
        //chama o end acaso não queira mais nada
      } else if (message.body && atendimento[tel].stage === 7) {
        dialogoDestino(client, message);
        atendimento[tel].stage = 15;
      } else if (message.body && atendimento[tel].stage === 15) {
        dialogoatendente(client, message);
        atendimento[tel].stage = 20;
      } else if (message.body && atendimento[tel].stage === 20) {
        atendimento[tel].stage = 170;
      }
      // ---------- manda pro suporte
      else if (message.body === "6" && atendimento[tel].stage === 2) {
        atendimento.end = message.body;
        dialogoatendente(client, message);
        atendimento[tel].stage = 17;
        //manda pro administrativo
      } else if (message.body && atendimento[tel].stage === 17) {
        atendimento[tel].stage = 170;
      } else if (message.body === "7" && atendimento[tel].stage === 2) {
        atendimento.end = message.body;
        dialogoatendente(client, message);
        atendimento[tel].stage = 18;
      } else if (message.body && atendimento[tel].stage === 18) {
        atendimento[tel].stage = 170;
      } else if (message.body === "8" && atendimento[tel].stage === 2) {
        atendimento.end = message.body;
        dialogoencerra(client, message);
        atendimento[tel].stage = 1;
      }

      // ---------------- joga o link pra comprar passagem-----------------
      else if (message.body === "1" && atendimento[tel].stage === 4) {
        atendimento[tel].passagem = message.body;
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
        atendimento[tel].stage = 3;
      }
      // --------------------- Final do ajuste ---------------
      // Caso algo de errado
      else {
        atendimento[tel].stage = 1;
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

venom
  .create({
    session: "Expresso", //name of session
  })
  .then((client) => start(client, 0))
  .catch((erro) => {
    console.log(erro);
  });
