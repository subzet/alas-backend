const {getBalance, getTransactions} = require('./transactionController')
const admin = require('firebase-admin');

async function getMainScreenData(uid){
    try{
        let result = {}
        let balance = await getBalance(uid)
        let transactions = await getTransactions(uid)
        let userData = (await admin.firestore().collection('users').doc(uid).get()).data()
        
        result.username = userData.nickName
        result.balanceLC = balance.lc
        result.balanceDAI = balance.dai
        result.userLC = 'ARS' //THIS HAS TO CHANGE BROO
        result.movements = transactions

        console.log(`Data for user ${uid} retrieved successfully`)
        return({result, code:200})
    }catch(error){
        console.log(`Error while retrieving user data: ${uid}. ${error.message}`)
        return ({msg:`Error while retrieving user data: ${uid}. ${error.message}`, code:500})
    }
}

exports.getMainScreenData = getMainScreenData;