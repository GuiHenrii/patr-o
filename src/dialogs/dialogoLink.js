async function dialogoencerra(client, message) {
  const texto =
    "Acesse o link e compre passagens com desconto!\nhttps://www.buson.com.br/viacao/expresso-de-luxo-mg ";
  await client
    .sendText(message.from, texto)
    .then(() => {
      console.log("Mensagem enviada");
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem", error);
    });
}

module.exports = dialogoencerra;
