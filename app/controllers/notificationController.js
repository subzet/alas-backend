const admin = require('firebase-admin');


async function registerToken(uid, token){
    try{
        await admin.firestore().collection('notifications').doc(uid).set({token})
        return{
            msg:`Token set succesfully: ${token} user: ${uid}`, code:200
        }
    }catch(error){
        return{
            msg:`Error setting token for user ${error.message}`, code:500
        }
    }
}


 module.exports = { registerToken }