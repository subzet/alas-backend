const moment = require('moment')


async function createTransaction(uid,body){
    const timestamp = moment().format()
    const type = body.type
}


exports.createTransaction = createTransaction;