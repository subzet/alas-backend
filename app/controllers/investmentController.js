const admin = require('firebase-admin');
const async = require('async');


const getInvestments = async (uid) => {
    console.log('Retrieving investments...')
    let result = []
    let snapshot = (await admin.firestore().collection('transactions').where('uid','==',uid).where('type','==','investment').get())

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

const getRates = async(protocols) => {
    const result = {}

    await async.eachLimit(protocols, 10, async(protocol) => {
        const ratesData = []
        const snapshot = (await admin.firestore().collection('defiRates').where('providerName','==',protocol).get())
        
        if(snapshot.empty){
            return []
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            ratesData.push(data)
        })

        //Sort ascending
        ratesData.sort((a,b) => {
            return Date.parse(a.timestamp) - Date.parse(b.timestamp)
        })

        result[protocol] = ratesData
    })


    return result
}

const mergeRates = async() => {
    try{
        const beginningDate = Date.now() - 604800000; //7 DAYS
        const beginningDateObject = new Date(beginningDate);
        const ratesData = []

        const snapshot = (await admin.firestore().collection('defiRates').where('timestamp','>',beginningDateObject).get())


        if(snapshot.empty){
            return []
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            ratesData.push(data)
        })

        const merged = ratesData.map(groupByDay)
        
        return {merged, code:200}
    }catch(error){
        const msg = error.message 
        return {msg, code}
    }
}

const groupByDay = (value, index, array) => {
    let byday={};
     let d = new Date(value['date']);
     d = Math.floor(d.getTime()/(1000*60*60*24));
     byday[d]=byday[d]||[];
     byday[d].push(value);
   return byday
 }
 
module.exports = { getInvestments, getRates, mergeRates }