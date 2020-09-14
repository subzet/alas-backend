const admin = require('firebase-admin');


async function assignWalletToUser(uid){
    let wallet = ''
    try{
        await admin.firestore().collection('wallets').doc(uid).set({wallet})
        console.log(`Wallet created successfully for user: ${uid}`)
        return({data:`Wallet created successfully for user: ${uid}`, code: 200})
    }catch(error){
        console.log(`Error while creating wallet for user: ${uid}. ${error.message}`)
        return ({msg:`Error while creating wallet for user: ${uid}.  ${error.message}`, code:500})
    }
}   

async function getUserWallet(uid){
    try{
        let data = (await admin.firestore().collection('wallets').doc(uid).get()).data()
        console.log(`Wallet retrieved successfully for user: ${uid}`)
        return({data, code: 200})
    }catch(error){
        console.log(`Error while retrieving wallet for user: ${uid}. ${error.message}`)
        return ({msg:`Error while retrieving wallet for user: ${uid}.  ${error.message}`, code:500})
    }
}


exports.assignWalletToUser = assignWalletToUser;
exports.getUserWallet = getUserWallet;