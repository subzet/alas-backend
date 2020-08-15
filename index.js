const express = require('express');
const cors = require('cors');
const app = express();
const { initializeApp , initializeDB } = require('./app/utils/firebase');
const criptoController = require('./app/controllers/criptoController')
const auth = require('./app/middleware/auth');

initializeApp();

const db = initializeDB();

app.use(cors({ origin: true }));

app.get('/ping', (req, res) => {
  return res.status(200).send('pong');
});

app.post('/transactions',auth, (req, res) => {
    res.status(200).send("Authorized!")
  });

app.get('/price/:key', auth, (req,res) =>{
    criptoController.getDefiPrices(req.params.key).then(
      response => {
        res.status(response.code).send(response);
      }
    ).catch(
        res.status(500).send({})
    );
})


if (!module.parent) {
  const server = app.listen(8080, () => {
    const { port } = server.address();
    console.log('Example app listening at http://localhost:%s', port);
  });
}

module.exports = app;