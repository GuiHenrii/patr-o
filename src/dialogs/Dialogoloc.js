async function dialogoloc(client, message) {
    await client
      .sendLocation(message.from, '', '', 'Brasil')
      .then((result) => {
        console.log('Result: ', result); //return object success
      })
      .catch((erro) => {
        console.error('Error when sending: ', erro); //return object error
      });
    }
    module.exports = dialogoloc;