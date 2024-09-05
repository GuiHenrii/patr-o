async function dialogoinicio(client, message) {
  const texto =
    "*Olá Tudo bem? Aqui é o Patrão📱, em que posso te ajudar hoje?.*\n------------------------------------------------------\nDigite o *número* correspondente ao que você deseja:\n\n1 - Celulares\n2 - Acessórios\n3 - Localização\n8 - Encerrar a Conversa.";

  await client
    .sendText(message.from, texto)
    .then(() => {
      console.log("Mensagem enviada com sucesso!");
    })
    .catch((erro) => {
      console.error("Erro ao enviar mensagem ", erro);
    });
}

module.exports = dialogoinicio;
