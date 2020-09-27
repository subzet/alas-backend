const moment = require('moment')
const { validTransactions, sendNotificationTransaction, substractFromBalance } = require('../config/config')
const { sendNotification, buildNotification } = require('./notificationController')
const { getDefiRates } = require('./criptoController')
const { mergeRates } = require('./investmentController')
const admin = require('firebase-admin');
 

async function createTransaction(uid,body){
    let transaction = {}
    try{
        transaction.timestamp = admin.firestore.FieldValue.serverTimestamp()
        transaction.type = validateType(body.type)
        transaction.typeDesc = validTransactions[body.type]
        transaction.amountLC = body.amountLC
        transaction.amountDAI = body.amountDAI
        transaction.userLC = body.userLC
        transaction.extra = body.extra
        transaction.uid = uid

        await storeTransaction(uid,transaction)
        
        if(sendNotificationTransaction.indexOf(transaction.type) >= 0){
            const notification = buildNotification(
                buildNotificationTitle(),
                buildNotificationBody(transaction),
                transaction
            )
            sendNotification(uid,notification)
        }

        await transactionPostWork(transaction)

        console.log(`Succesfully created transaction for user: ${uid}.`)
        return ({msg:`Succesfully created transaction for user: ${uid}.`, code:200})
    }catch(error){
        console.log(`Error while creating transaction for user: ${uid}. ${error.message}`)
        return ({msg:`Error while creating transaction for user: ${uid}.  ${error.message}`, code:500})
    }
    
}

const buildNotificationTitle = () => {
    return "Nueva recepción de dinero"
}

const buildNotificationBody = trx => {
    return `Has recibido ${trx.amountLC} ${trx.userLC}`
}


function validateType(type){
    let keys = Object.keys(validTransactions)
    if(keys.indexOf(type) > 0){
        return type
    }

    throw Error('Not a valid transaction type.')
}

async function storeTransaction(uid, transaction){
    let balanceRef = await admin.firestore().collection('balance').doc(uid)
    let txRef = await admin.firestore().collection('transactions').doc()
    //Create transaction..
    let batch = admin.firestore().batch()
    let balance = (await balanceRef.get()).data()
    
    console.log('Creating transaction..')
    await batch.create(txRef,transaction)

    if(substractFromBalance[transaction.type]){
        balance.dai -= transaction.amountDAI 
        balance.lc -= transaction.amountLC
    }else{
        balance.dai += transaction.amountDAI 
        balance.lc += transaction.amountLC
    }

    if(balance.dai < 0 || balance.lc < 0){
        throw Error('No tienes fondos suficientes en tu cuenta!')
    }
   
    console.log('Updating balance..')
    await batch.set(balanceRef, balance)

    console.log('Securing batch.')
    batch.commit().then(()=>{
        console.log('Batch Transaction Created Succesfully')
    })
}

async function getBalance(uid){
    return (await admin.firestore().collection('balance').doc(uid).get()).data()
}

async function getTransactions(uid){
    console.log('Retrieving transactions...')
    let result = []
    let snapshot = (await admin.firestore().collection('transactions').where('uid','==',uid).get())
    if(snapshot.empty){
        return []
    }
    
    snapshot.forEach(snapshot => {
        let data = snapshot.data()
        delete data['uid']

        //Transform Timestamp
        data.timestamp = moment(data.timestamp.toDate()).format()

        result.push(data)
    })

    result.sort((a,b) => {
        return Date.parse(b.timestamp) - Date.parse(a.timestamp)
    })

    return result
}

async function transactionPostWork(trx) {
    if(trx.type === 'investment'){
        console.log("Finishing transaction..")
            await getDefiRates()
            await mergeRates()
    }
}





exports.createTransaction = createTransaction;
exports.getBalance = getBalance;
exports.getTransactions = getTransactions;
exports.transaction = getTransactions;