const moment = require('moment')
const { validTransactions } = require('../config/config')
const admin = require('firebase-admin');

async function createTransaction(uid,body){
    let transaction = {}
    try{
        transaction.timestamp = moment().format()
        transaction.type = validateType(body.type)
        transaction.typeDesc = validTransactions[body.type]
        transaction.amountLC = body.amountLC
        transaction.amountDAI = body.amountDAI
        transaction.userLC = body.userLC
        transaction.extra = body.extra
        transaction.uid = uid

        await storeTransaction(uid,transaction)
        console.log(`Succesfully created transaction for user: ${uid}.`)
        return ({msg:`Succesfully created transaction for user: ${uid}.`, code:200})
    }catch(error){
        console.log(`Error while creating transaction for user: ${uid}. ${error.message}`)
        return ({msg:`Error while creating transaction for user: ${uid}.  ${error.message}`, code:500})
    }
    
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

    balance.dai += transaction.amountDAI 
    balance.lc += transaction.amountLC
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
        result.push(data)
    })

    return result
}


exports.createTransaction = createTransaction;
exports.getBalance = getBalance;
exports.getTransactions = getTransactions;
exports.transaction = getTransactions;