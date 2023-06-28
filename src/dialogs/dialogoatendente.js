async function dialogoatendente(client, message) {
  const texto =
    "Certo, vou encaminhar para o nosso atendente. Ele responderá a você em breve.";
  await client
    .sendText(message.from, texto)
    .then(async () => {
      console.log("Result: ", "result"); //retorna o objeto de sucesso
      await client.markUnseenMessage(message.from); // marca a mensagem como não vista
    })
    .catch((erro) => {
      console.error("Erro ao enviar mensagem: ", erro); //retorna o objeto de erro
    });
}

module.exports = dialogoatendente;