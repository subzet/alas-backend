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

const getRates = async(protocols) => {
    let result = {}

    await async.eachLimit(protocols, 10, async(protocol) => {
        const ratesData = []
        const snapshot = (await admin.firestore().collection('ratesMerged').where('provider','==',protocol.protocol).where('timestamp', '>=', protocol.investments[0].timestamp).get())
        
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

        result[protocol.protocol] = ratesData
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
            return {data:[], code:200}
        }

        snapshot.forEach(snapshot => {
            let data = snapshot.data()
            data.timestamp = data.timestamp.toDate()
            ratesData.push(data)
        })


        const dates = [...new Set(ratesData.map(rate => rate.timestamp.toISOString().slice(0,10) + ' 00:00'))]
        const providers = [...new Set(ratesData.map(rate => rate.providerName))]

        const merged = {}

        dates.forEach(async (date) => {
            providers.forEach(async (provider) => {
                const rates = ratesData.filter(rate => rate.providerName === provider && datesAreOnSameDay(rate.timestamp,new Date(date)))
                const avgRate = rates.reduce((total, rate) => total + (rate.actualInterest || 0), 0) / rates.length;
                const timestamp = admin.firestore.Timestamp.fromDate(rates[rates.length - 1].timestamp)
                const icon = rates[rates.length - 1].providerImg  
                const lastrun = admin.firestore.FieldValue.serverTimestamp()

                const mergedRate = {
                    averageRate: avgRate,
                    provider,
                    lastrun,
                    icon,
                    timestamp
                } 

                if(merged[date.split(' ')[0]]){
                    merged[date.split(' ')[0]][provider] = mergedRate

                }else{
                    merged[date.split(' ')[0]] = {}
                    merged[date.split(' ')[0]][provider] = mergedRate
                }
                
                const key = date.split(' ')[0] + "-" + provider
                await admin.firestore().collection('ratesMerged').doc(key).set(mergedRate)
            });
        });

        return {merged, code:200}
    }catch(error){
        const msg = error.message 
        return { msg, code:500 }
    }
}

const datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
 
module.exports = { getInvestments, getRates, mergeRates }