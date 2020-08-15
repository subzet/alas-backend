const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase/alas-ec935-firebase-adminsdk-ud7x2-ed256a3669.json')

const initializeApp = () => {
    const credentials = {
        credential: admin.credential.cert(serviceAccount),
        databaseUrl: "https://alas-ec935.firebaseio.com"
    }
    admin.initializeApp(credentials)
}

const initializeDB = () => {
    return admin.firestore()
}


module.exports = { initializeApp , initializeDB }