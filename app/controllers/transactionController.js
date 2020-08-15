const moment = require('moment')


async function createTransaction(body){
    const timestamp = moment().format()
    const type = body.type
}