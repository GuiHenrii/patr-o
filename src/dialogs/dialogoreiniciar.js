async function dialogoreiniciar(client, message) {
  const texto =
    "*Devido a falta de resposta, Vamos encerrar o seu atendimento caso queira continuar seu atendimento envie uma nova mensagem.";
  await client
    .sendText(message.from, texto)
    .then(() => {
      console.log("Mensagem enviada");
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem", error);
    });
}
module.exports = dialogoreiniciar; 