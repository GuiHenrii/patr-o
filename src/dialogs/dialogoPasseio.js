async function dialogoPasseio(client, message) {
  const texto = "*Possui algum passeio incluído no pacote?*";
  await client
    .sendText(message.from, texto)
    .then(() => {
      console.log("Message sent.");
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem", error);
    });
}
module.exports = dialogoPasseio; 
