async function dialogoreiniciar(client, message) {
  const texto =
    "*Devido a falta de resposta. Vamos reiniciar o seu atendimento.";
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