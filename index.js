const express = require('express');
const cors = require('cors');
const app = express();
const { initializeApp  } = require('./app/utils/firebase');
const criptoController = require('./app/controllers/criptoController');
const transactionController = require('./app/controllers/transactionController');
const auth = require('./app/middleware/auth');

initializeApp();

app.use(cors({ origin: true }));

app.get('/ping', (req, res) => {
  return res.status(200).send('pong');
});

app.post('/transactions',auth, (req, res) => {
//Creates a transaction.
    transactionController.createTransaction(req.body).then(
      (response) => {
        res.status(response.code).send(response);
      }
    )
}); 

app.get('/price/:key', auth, (req,res) =>{
//Creates a transaction gets the conversion price for a crypto currency.
    criptoController.getDefiPrices(req.params.key).then(
      (response) => {
        res.status(response.code).send(response);
      }
    )
});


if (!module.parent) {
  const server = app.listen(process.env.PORT || 8080, () => {
    const { port } = server.address();
    console.log('Example app listening at http://localhost:%s', port);
  });
}

module.exports = app;