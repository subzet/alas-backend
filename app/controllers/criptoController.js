const { scrap } = require('../services/cryptoPrices.js')
const { scrapRates } = require('../services/defiRates.js')
const admin = require('firebase-admin');


async function saveDocument(key, data, collection){
    await admin.firestore().collection(collection).doc(key).set(data)
}


async function getDefiPrices(key){ 
    try{
        const data = await scrap()
        let result;
        
        for(let index = 0; index < data.length; index += 1){
            const docKey =  [data[index].key,data[index].timestamp].join('_')
            await saveDocument(docKey, data[index],'cryptos')
            if(data[index].key === key){
                result = data[index]
            }
        }

        if(result === undefined){
            return {msg: `Couldn't get price for key provided: ${key}`, code: 404};
        }

        return {data: result, code: 200};
    }catch(error){
        console.log(error.message)
        return {msg: error.message, code: 500};
    } 
}

//Get's rates from defiRates.com
async function getDefiRates(){
    try{
        const data = await scrapRates()
        
        for(let index = 0; index < data.length; index += 1){
            const key = [data[index].providerName, data[index].timestamp].join('_') 
            await saveDocument(key, data[index],'defiRates')
        }

        return {data, code: 200};
    }catch(error){
        console.log(error.message)
        return {msg: error.message, code: 500};
    } 
}

exports.getDefiPrices = getDefiPrices;
exports.getDefiRates = getDefiRates;