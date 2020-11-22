const axios = require('axios'),
      url = `https://api.loanscan.io/v1/interest-rates`
      moment = require('moment'),
      admin = require('firebase-admin')
      apiKey = process.env.LOAN_SCAN_API_KEY,
      async = require('async');
const { providersImagesUri } = require('../config/config');
      

async function getData(){
    try{
        const headers = {
            "x-api-key":apiKey
        }
        const response = await axios.get(url,{headers})
        if(response.status == 200){
            return response.data
        }
    }catch(error){
        console.log(`Error while getting results from loanscan.io: ${error.message}`)
        throw error
    }
}

async function scrapRates(){
    const data = await getData()
    //const data = sampleResponse;
    const providers = []
    async.forEachLimit(data, 100, async(provider) => {
        try{
            const providerName = normalizeProviderName(provider.provider)
            const daiRate = provider.supply.filter(coin => coin.symbol === 'DAI')[0]
            if(daiRate){
                const result = {
                    providerName,
                    providerImg: await getProviderImg(providerName),
                    actualInterest: daiRate.rate,
                    avgInterest: null,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                }
                providers.push(result)
            }
        }catch(error){
            console.log(error.message)
        }
    })

    providers.sort((a,b) => b.actualInterest - a.actualInterest)

    return providers
}

async function getProviderImg(providerName){
    const uri = providersImagesUri[providerName]
    if(uri){
        return uri
    }

    throw Error(`No image available for provider ${providerName}`)
}

function normalizeProviderName(providerRawName){
    if(providerRawName === 'CompoundV2') return 'compound v2';
    if(providerRawName === 'AaveVariable') return 'aave';

    return providerRawName.toLowerCase()
}

module.exports = { scrapRates }