const admin = require('firebase-admin');
const { push }  = require('../utils/expo')


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

async function fetchToken(uid){
    try{
        const token = (await admin.firestore().collection('notifications').doc(uid).get()).token
        return{
            token, code:200
        }
    }catch(error){
        return{
            msg:`Error fetching token for user ${error.message}`, code:500
        }
    }
}

async function sendNotification(uid, notification){
    const token = (await fetchToken(uid)).token
    let notificationToSend = notification
    notificationToSend.to = token

    push(notificationToSend)
}

const buildNotification = (title,body,extraData) => {
    return  {
        title,
        body,
        data:extraData
    }
}


 module.exports = { registerToken, sendNotification, buildNotification }