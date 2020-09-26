const admin = require('firebase-admin');
const async = require('async');


const getInvestments = async (uid) => {
    console.log('Retrieving investments...')
    let result = []
    let snapshotInvestments = (await admin.firestore().collection('transactions').where('uid','==',uid).where('type','==','investment').get())
    let snapshotWithdrawals = (await admin.firestore().collection('transactions').where('uid','==',uid).where('type','==','withdraw-from-investment').get())

    if(snapshotInvestments.empty && snapshotWithdrawals.empty){
        return []
    }

    snapshotInvestments.forEach(snapshot => {
        let data = snapshot.data()
        delete data['uid']
        data.dateOrder =  moment(data.timestamp.toDate()).format()
        result.push(data)
    })

    snapshotWithdrawals.forEach(snapshot => {
        let data = snapshot.data()
        data.dateOrder =  moment(data.timestamp.toDate()).format()
        delete data['uid']
        result.push(data)
    })

    //Order by date.
    result.sort((a,b) => {
        return Date.parse(a.dateOrder) - Date.parse(b.dateOrder)
    })
    

    return result
} 

const getRates = async(protocols, startDate) => {
    const result = {}

    await async.eachLimit(protocols, 10, async(protocol) => {
        const ratesData = []
        const snapshot = (await admin.firestore().collection('ratesMerged').where('provider','==',protocol).where('timestamp', '>=', startDate).get())
        
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
    //Takes de last 7 seven days of rates and merges it to a single rate.
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
            data.timestamp = moment(data.timestamp.toDate()).format()
            ratesData.push(data)
        })


        let merged = {}
        
        ratesData.forEach(rate => {
            const date = new Date(rate.timestamp).toISOString().slice(0,10);
            const provider = rate.providerName
            
            if(merged[date] != undefined){
                if(merged[date][provider] != undefined){
                    merged[date][provider].averageRate.push(rate.actualInterest)
                    let timestamp = new Date(rate.timestamp)
                    merged[date][provider].timestamp = admin.firestore.Timestamp.fromDate(timestamp)
                }else{
                    merged[date][provider] = {}
                    merged[date][provider].averageRate = []
                    merged[date][provider].averageRate.push(rate.actualInterest)
                    let timestamp = new Date(rate.timestamp)
                    merged[date][provider].timestamp = admin.firestore.Timestamp.fromDate(timestamp)
                }
            }else{
                merged[date] = {}
                merged[date][provider] = {}
                merged[date][provider].averageRate = []
                merged[date][provider].averageRate.push(rate.actualInterest)
                let timestamp = new Date(rate.timestamp)
                merged[date][provider].timestamp = admin.firestore.Timestamp.fromDate(timestamp)
            }
        })


        Object.keys(merged).forEach(async (date) => {
            Object.keys(merged[date]).forEach(async (provider) => {
                let sum = merged[date][provider].averageRate.reduce((previous, current) => current += previous);
                let avg = sum / merged[date][provider].averageRate.length;
                merged[date][provider].averageRate = avg
                merged[date][provider].provider = provider
                merged[date][provider].lastrun = admin.firestore.FieldValue.serverTimestamp()
                const key = [date,provider].join('-')
                await admin.firestore().collection('ratesMerged').doc(key).set(merged[date][provider])
            })
        })
        
        return {merged, code:200}
    }catch(error){
        const msg = error.message 
        return { msg, code:500 }
    }
}

 
module.exports = { getInvestments, getRates, mergeRates }