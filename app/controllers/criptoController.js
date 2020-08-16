const { scrap } = require('../services/cryptoPrices.js')
const admin = require('firebase-admin');


async function saveDocument(data){
    const document = data
    const key =  data.key +'_'+ data.timestamp
    
    await admin.firestore().collection('cryptos').doc(key).set(document)
}


async function getDefiPrices(key){ 
    try{
        const data = await scrap()
        let result;
        
        for(let index = 0; index < data.length; index += 1){
            await saveDocument(data[index])
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

}

exports.getDefiPrices = getDefiPrices;
exports.getDefiRates = getDefiRates;