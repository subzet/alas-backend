const axios = require('axios');
const moment = require('moment');
const daiUrl = 'https://be.buenbit.com/api/market/tickers/';
const admin = require('firebase-admin')

const getPriceTemplate = () => {
    return priceData = {
        timestamp: '',
        currency: '',
        conversion: '', 
        buy: '',
        sell: '',
        key: ''
    } 
}

function formatResponse(data){
    let result = []
    let keys = Object.keys(data)
    for(let index = 0; index < keys.length; index += 1){
        let template = getPriceTemplate()
        template.timestamp = admin.firestore.FieldValue.serverTimestamp()
        template.currency = data[keys[index]].bid_currency
        template.conversion = data[keys[index]].ask_currency
        template.buy = data[keys[index]].selling_price
        template.sell = data[keys[index]].purchase_price
        template.key = data[keys[index]].market_identifier 
        result.push(template)
    }

    return result;
}

async function getCryptoPrice(){
    try{
        let response = await axios.get(daiUrl)
        return response.data.object
    }catch(error){
        console.log('Error while getting crypto prices:' + error.message)
    }

    return undefined
}

async function scrap(){
    const data = await getCryptoPrice()
    const formattedResponse = formatResponse(data)
    return formattedResponse
}

module.exports = { scrap }