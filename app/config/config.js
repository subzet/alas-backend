require('dotenv').config()

const googleKey = {
    type: process.env.GOOGLE_TYPE,
    project_id:process.env.PROJECT_ID,
    private_key_id:process.env.PRIVATE_KEY_ID,
    private_key:process.env.PRIVATE_KEY,
    client_email:process.env.CLIENT_EMAIL,
    client_id:process.env.CLIENT_ID,
    auth_uri:process.env.AUTH_URI,
    token_uri:process.env.TOKEN_URI,
    auth_provider_x509_cert_url:process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url:process.env.CLIENT_X509_CERT_URL
}

const validTransactions = {
    'money-transfer':'Recepción de dinero.',
    'money-sent':'Envio de dinero.',
    'bank-transfer':'Depósito de dinero.',
    'payment':'Pago',
    'investment':'Inversión',
    'withdraw-from-investment':'Retiro de inversión',
    'withdraw': 'Retiro'
}

const substractFromBalance = {
    
    'money-sent':   true,
    'bank-transfer': false,
    'payment': true,
    'investment': true,
    'withdraw-from-investment': false,
    'withdraw': true

}

const providersImagesUri = {
    'fulcrum':'https://defirate.com/wp-content/uploads/2019/11/fulcrum_logo.png',
    'dydx':'https://defirate.com/wp-content/uploads/2019/09/dydx.png',
    'aave':'https://defirate.com/wp-content/uploads/2020/01/Aave-Ghost-Horizontal.png',
    'nuo':'https://defirate.com/wp-content/uploads/2019/09/nuo.png',
    'compound v2':'https://defirate.com/wp-content/uploads/2019/09/compound.svg',
    'coinlist':'https://defirate.com/wp-content/uploads/2020/04/coinlist-trans.png',
    'coinbase':'https://defirate.com/wp-content/uploads/2019/09/coinbase.png',
    'bitfinex':'https://defirate.com/wp-content/uploads/2019/09/bitfinex.png'
}

const sendNotificationTransaction = ['bank-transfer','money-transfer']


module.exports = { googleKey, validTransactions, sendNotificationTransaction, substractFromBalance,providersImagesUri }